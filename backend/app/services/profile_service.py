from app.repositories.json_repository import JSONRepository
from app.schemas.profile import Profile


class ProfileService(JSONRepository):
  def __init__(self):
    super().__init__()

  def load_profile(self) -> Profile:
    try:
      return self.read_json('profile.json', Profile)
    except FileNotFoundError:
      return Profile.empty()

  def save_profile(self, profile: Profile) -> None:
    self.write_json('profile.json', profile)


_service = ProfileService()

load_profile = _service.load_profile
save_profile = _service.save_profile
