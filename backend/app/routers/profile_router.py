from fastapi import APIRouter

from app.schemas import Profile
from app.services import profile_service

router = APIRouter(
  prefix='/profile',
  tags=['Profile'],
)


@router.get('', response_model=Profile)
async def get_profile():
  profile = profile_service.load_profile()
  return profile


@router.put('', response_model=Profile)
async def update_profile(profile: Profile):
  profile_service.save_profile(profile)
  return profile
