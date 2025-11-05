import json
import os

from app.schemas.profile import Profile

PROFILE_PATH = os.getenv('PROFILE_PATH', 'data/profile.json')


def load_profile() -> Profile:
  try:
    with open(PROFILE_PATH) as f:
      data = json.load(f)
      return Profile(**data)
  except FileNotFoundError:
    return Profile.empty()
  except Exception as e:
    raise e


def save_profile(profile: Profile) -> None:
  try:
    os.makedirs(os.path.dirname(PROFILE_PATH), exist_ok=True)
    with open(PROFILE_PATH, 'w') as f:
      json.dump(profile.model_dump(), f, indent=2)
  except Exception as e:
    raise e
