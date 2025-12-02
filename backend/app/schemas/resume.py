from uuid import UUID, uuid4

from pydantic import BaseModel, Field


class DetailedItem(BaseModel):
  title: str
  subtitle: str | None = None
  start_date: str | None = None
  end_date: str | None = None
  bullets: list[str]


class DetailedSectionContent(BaseModel):
  bullets: list[DetailedItem]


class SimpleSectionContent(BaseModel):
  bullets: list[str]


class ParagraphSectionContent(BaseModel):
  text: str


SectionContent = DetailedSectionContent | SimpleSectionContent | ParagraphSectionContent


class Section(BaseModel):
  id: str
  type: str
  title: str
  order: int
  content: SectionContent


class ResumeData(BaseModel):
  sections: list[Section]


class Resume(BaseModel):
  id: UUID = Field(default_factory=uuid4)
  listing_id: UUID
  template: str
  data: ResumeData
