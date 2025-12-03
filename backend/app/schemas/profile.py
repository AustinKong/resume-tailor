from typing import Self

from pydantic import EmailStr, Field

from app.schemas.types import CamelModel, YearMonth


class Education(CamelModel):
  institution: str
  program: str
  location: str | None = None
  start_date: YearMonth
  end_date: YearMonth | None = None
  bullets: list[str] = Field(
    default_factory=list,
    description='Key courses, GPA, thesis, or other relevant details',
  )


class Profile(CamelModel):
  full_name: str
  email: EmailStr | None = None
  phone: str | None = None
  location: str | None = None
  website: str | None = None

  education: list[Education] = Field(
    default_factory=list,
    description='Education history',
  )

  certifications: list[str] = Field(
    default_factory=list,
    description='List of certifications',
  )

  awards: list[str] = Field(
    default_factory=list,
    description='List of awards and honors',
  )

  @classmethod
  def empty(cls) -> Self:
    return cls(
      full_name='',
      email=None,
      phone=None,
      location=None,
      website=None,
      education=[],
      certifications=[],
      awards=[],
    )
