from fastapi import APIRouter, HTTPException, status

from app.schemas.profile import Profile
from app.services import profile_service

router = APIRouter(
  prefix='/profile',
  tags=['Profile'],
)


@router.get('', response_model=Profile)
async def get_profile():
  try:
    profile = profile_service.load_profile()
    return profile
  except (ValueError, FileNotFoundError) as e:
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e)) from e


@router.put('', response_model=Profile)
async def update_profile(profile: Profile):
  profile_service.save_profile(profile)
  return profile
