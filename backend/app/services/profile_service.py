from app.repositories import JSONRepository
from app.schemas import Profile


class ProfileService(JSONRepository):
  def __init__(self):
    super().__init__()

  def get(self) -> Profile:
    return self.read_json('profile.json', Profile)

  def update(self, profile: Profile) -> None:
    self.write_json('profile.json', profile)
