from app.repositories import JSONRepository
from app.schemas import Profile


class ProfileService(JSONRepository):
  def __init__(self):
    super().__init__()

  def load_profile(self) -> Profile:
    return self.read_json('profile.json', Profile)

  def save_profile(self, profile: Profile) -> None:
    self.write_json('profile.json', profile)


_service = ProfileService()

load_profile = _service.load_profile
save_profile = _service.save_profile
