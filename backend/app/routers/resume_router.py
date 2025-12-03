import asyncio
from uuid import UUID, uuid4

from fastapi import APIRouter, HTTPException
from fastapi.responses import Response

from app.schemas.experience import Experience, LLMResponseExperience
from app.schemas.resume import (
  DetailedItem,
  DetailedSectionContent,
  Resume,
  ResumeData,
  Section,
)
from app.services import (
  experience_service,
  listings_service,
  llm_service,
  profile_service,
  resume_service,
  template_service,
)

router = APIRouter(
  prefix='/resume',
  tags=['Resume'],
)

OPTIMIZATION_PROMPT = """
You are an expert Resume Editor. Your goal is to reframe the candidate's existing experience to 
align with the Job Listing, WITHOUT inventing new facts.

### THE TARGET (JOB LISTING)
Role: {listing_title}
Requirements: {listing_requirements}
Keywords: {listing_skills}

### THE SOURCE (CANDIDATE EXPERIENCE)
Role: {exp_title}
Company: {exp_organization}
Original Bullets:
{exp_bullets}

### STRICT GROUNDING RULES (READ CAREFULLY)
1. **NO HALLUCINATIONS:** You are strictly forbidden from adding "Hard Skills" 
    (Programming Languages, Frameworks, Spoken Languages) that are not present in the Source text.
   - *Example:* If Listing asks for "C++" but Source only mentions "Web Apps", DO NOT write "C++".
   - *Example:* If Listing asks for "Chinese" but Source does not mention it, DO NOT write "Fluent 
    in Chinese".

2. **EVIDENCE-BASED REWRITING:** Every claim you write must be logically supported by the Source.
   - *Source:* "Built web apps." -> *Rewrite:* "Architected scalable web solutions." (OK - Rephrasing)
   - *Source:* "Built web apps." -> *Rewrite:* "Built web apps using Java." (FAIL - Inventing Java)

3. **OMISSION IS BETTER THAN LYING:** If the Candidate's experience does not match a specific 
    Requirement in the Listing, IGNORE that requirement. Do not force a match.

4. **STYLE:** Use strong, high-impact action verbs. Keep it professional.
"""


@router.get('/{resume_id}')
async def get_resume(resume_id: str) -> Resume:
  resume = resume_service.get_resume_by_id(resume_id)
  if not resume:
    raise HTTPException(404, f'Resume {resume_id} not found')
  return resume


@router.get('/{resume_id}/html')
async def get_html(resume_id: str):
  resume = resume_service.get_resume_by_id(resume_id)
  if not resume:
    raise HTTPException(404, f'Resume {resume_id} not found')

  profile = profile_service.load_profile()
  html = template_service.render(resume.template, profile, resume)

  return {'html': html}


@router.post('/')
async def create_resume(listing_id: str):
  # TODO: Add an empty constructor to ResumeData
  empty_data = ResumeData(sections=[])

  resume = Resume(
    id=uuid4(),
    listing_id=UUID(listing_id),
    template='template-1.html',
    data=empty_data,
  )
  resume_service.create_resume(resume)
  return resume


@router.post('/{resume_id}/generate')
async def generate_resume_content(resume_id: str):
  resume = resume_service.get_resume_by_id(resume_id)
  if not resume:
    raise HTTPException(404, f'Resume {resume_id} not found')

  listing = listings_service.get_listing_by_id(str(resume.listing_id))

  if not listing:
    raise HTTPException(404, f'Listing {resume.listing_id} not found')

  relevant_experiences: list[Experience] = experience_service.search_relevant_experiences(listing)

  responses = await asyncio.gather(
    *[
      llm_service.call_structured(
        input=OPTIMIZATION_PROMPT.format(
          listing_title=listing.title,
          listing_requirements=listing.requirements,
          listing_skills=listing.skills,
          exp_title=exp.title,
          exp_organization=exp.organization,
          exp_bullets='\n'.join(exp.bullets),
        ),
        response_model=LLMResponseExperience,
      )
      for exp in relevant_experiences
    ]
  )

  customised_experiences: list[Experience] = []
  for exp, resp in zip(relevant_experiences, responses, strict=False):
    exp.bullets = resp.bullets
    customised_experiences.append(exp)

  # Map pruned experiences to DetailedItem objects and sort by end_date (desc), then start_date (desc)
  def sort_key(exp: Experience):
    # If end_date is None, treat as ongoing (sort first)
    end = exp.end_date or '9999-12'
    start = exp.start_date or '0000-00'
    return (end, start)

  sorted_experiences = sorted(customised_experiences, key=sort_key, reverse=True)
  detailed_items = [
    DetailedItem(
      title=exp.title,
      subtitle=exp.organization,
      start_date=exp.start_date,
      end_date=exp.end_date,
      bullets=exp.bullets,
    )
    for exp in sorted_experiences
  ]

  # Create a single "Work Experience" section (exclude skills for now)
  generated_data = ResumeData(
    sections=[
      Section(
        id='1',
        type='detailed',
        title='Work Experience',
        order=0,
        content=DetailedSectionContent(bullets=detailed_items),
      )
    ]
  )

  # TODO: Add a projects section

  resume.data = generated_data
  updated_resume = resume_service.update_resume(resume)
  return updated_resume


@router.put('/{resume_id}')
async def update_resume(resume_id: str, data: ResumeData) -> Resume:
  resume = resume_service.get_resume_by_id(resume_id)
  if not resume:
    raise HTTPException(404, f'Resume {resume_id} not found')

  resume.data = data
  updated_resume = resume_service.update_resume(resume)
  return updated_resume


@router.delete('/{resume_id}')
async def delete_resume(resume_id: str):
  """Delete a resume by ID."""
  deleted = resume_service.delete_resume(resume_id)
  if not deleted:
    raise HTTPException(404, f'Resume {resume_id} not found')

  return {'message': 'Resume deleted successfully'}


@router.get('/{resume_id}/export')
async def export_resume(resume_id: str) -> Response:
  resume = resume_service.get_resume_by_id(resume_id)
  if not resume:
    raise HTTPException(404, f'Resume {resume_id} not found')

  profile = profile_service.load_profile()
  try:
    pdf_bytes = template_service.render_pdf(resume.template, profile, resume)
  except Exception as e:
    raise HTTPException(500, f'Failed to render PDF: {e}') from e

  filename = f'resume_{resume.id}.pdf'
  return Response(
    content=pdf_bytes,
    media_type='application/pdf',
    headers={
      'Content-Disposition': f'attachment; filename="{filename}"',
    },
  )
