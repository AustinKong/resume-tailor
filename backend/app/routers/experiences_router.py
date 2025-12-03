from uuid import UUID

from fastapi import APIRouter, HTTPException, status

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
async def get_experience(id: str):
  try:
    experience = experience_service.load_experience(UUID(id))
    return experience
  except ValueError as e:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e)) from e


@router.post('', response_model=Experience)
async def create_experience(experience: Experience):
  experience_service.save_experience(experience)
  return experience


@router.put('', response_model=Experience)
async def update_experience(experience: Experience):
  updated_experience = experience_service.update_experience(experience)
  return updated_experience


@router.delete('/{id}', response_model=None)
async def delete_experience(id: str):
  experience_service.delete_experience(UUID(id))
  return None
