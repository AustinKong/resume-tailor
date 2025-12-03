from uuid import UUID

from fastapi import APIRouter

from app.schemas.experience import Experience
from app.services import experience_service

router = APIRouter(
  prefix='/experiences',
  tags=['Experiences'],
)


@router.get('', response_model=list[Experience])
async def get_experiences():
  experiences = experience_service.load_experiences()
  return experiences


@router.get('/{id}', response_model=Experience)
async def get_experience(id: UUID):
  experience = experience_service.load_experience(id)
  return experience


@router.post('', response_model=Experience)
async def create_experience(experience: Experience):
  experience_service.save_experience(experience)
  return experience


@router.put('', response_model=Experience)
async def update_experience(experience: Experience):
  updated_experience = experience_service.update_experience(experience)
  return updated_experience


@router.delete('/{id}', response_model=None)
async def delete_experience(id: UUID):
  experience_service.delete_experience(id)
  return None
