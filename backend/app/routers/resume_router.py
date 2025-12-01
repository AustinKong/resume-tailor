import time
from uuid import UUID, uuid4

from fastapi import APIRouter, HTTPException

from app.schemas.resume import (
  DetailedItem,
  DetailedSectionContent,
  Resume,
  ResumeData,
  Section,
  SimpleSectionContent,
)
from app.services import profile_service, resume_service, template_service

router = APIRouter(
  prefix='/resume',
  tags=['Resume'],
)


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
    exported=None,
  )
  resume_service.create_resume(resume)
  return resume


@router.post('/{resume_id}/generate')
async def generate_resume_content(resume_id: str):
  resume = resume_service.get_resume_by_id(resume_id)
  if not resume:
    raise HTTPException(404, f'Resume {resume_id} not found')

  # TODO: Replace with actual LLM service that uses the listing data
  # For now, generate dummy data
  generated_data = ResumeData(
    sections=[
      Section(
        id='1',
        type='detailed',
        title='Work Experience',
        order=0,
        content=DetailedSectionContent(
          bullets=[
            DetailedItem(
              title='Senior Software Engineer',
              subtitle='Tech Corp',
              start_date='2020-01',
              end_date='2023-06',
              bullets=[
                'Led team of 5 engineers in developing microservices architecture',
                'Improved system performance by 40% through optimization',
                'Mentored junior developers and conducted code reviews',
              ],
            ),
            DetailedItem(
              title='Software Engineer',
              subtitle='StartupCo',
              start_date='2018-06',
              end_date='2019-12',
              bullets=[
                'Built RESTful APIs using Python and FastAPI',
                'Implemented CI/CD pipelines with Docker and GitHub Actions',
              ],
            ),
          ]
        ),
      ),
      Section(
        id='2',
        type='simple',
        title='Skills',
        order=1,
        content=SimpleSectionContent(
          bullets=[
            'Python, FastAPI, React, TypeScript',
            'PostgreSQL, MongoDB, Redis',
            'Docker, Kubernetes, AWS',
            'Git, CI/CD, Agile/Scrum',
          ]
        ),
      ),
    ]
  )

  time.sleep(2)

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
