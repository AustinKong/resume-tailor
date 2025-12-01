from fastapi import APIRouter, HTTPException

from app.schemas.resume import Resume, ResumeData
from app.services import profile_service, resume_service, template_service

router = APIRouter(
  prefix='/resume',
  tags=['Resume'],
)


@router.post('/')
async def generate_resume(listing_id: str):
  from uuid import UUID, uuid4

  from app.schemas.resume import DetailedItem, DetailedSectionContent, Section, SimpleSectionContent

  resume = resume_service.get_resume_by_listing_id(listing_id)
  if not resume:
    dummy_data = ResumeData(
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

    resume = Resume(
      id=uuid4(),
      listing_id=UUID(listing_id),
      template='example_resume.html',
      data=dummy_data,
      exported=None,
    )
    resume_service.create_resume(resume)

  profile = profile_service.load_profile()
  context = {
    'profile': profile.model_dump(mode='json'),
    **resume.data.model_dump(mode='json'),
  }

  html = template_service.render(resume.template, context)

  return {
    'html': html,
    'resume': resume.model_dump(mode='json'),
  }


@router.put('/{resume_id}')
async def update_resume(resume_id: str, data: ResumeData):
  resume = resume_service.get_resume_by_id(resume_id)
  if not resume:
    raise HTTPException(404, f'Resume {resume_id} not found')

  resume.data = data
  updated_resume = resume_service.update_resume(resume)

  profile = profile_service.load_profile()
  context = {
    'profile': profile.model_dump(mode='json'),
    **data.model_dump(mode='json'),
  }

  html = template_service.render(updated_resume.template, context)

  return {
    'html': html,
    'resume': updated_resume.model_dump(mode='json'),
  }
