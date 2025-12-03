import asyncio

from fastapi import APIRouter, HTTPException, status
from pydantic import HttpUrl

from app.schemas.listing import (
  DuplicateListing,
  Listing,
  LLMResponseListing,
  ScrapeResult,
)
from app.services import listings_service, llm_service, scraping_service
from app.utils.url import normalize_url

LISTING_EXTRACTION_PROMPT = """
You are an expert Technical Recruiter and Data Parser. Your goal is to extract
structured data from the job listing below to power a semantic search engine.

### DATA EXTRACTION RULES

1. **title**: Extract the specific job role.
   - CLEAN IT: Remove prefixes like "Job Listing for", "We are hiring a",
     "Vacancy:", or company names.
   - Bad: "Job Listing for SDK Client Engineer Intern"
   - Good: "SDK Client Engineer Intern"

2. **skills**: Extract a list of specific, searchable nouns (Tools,
   Languages, Frameworks, Platforms, Certifications).
   - Example: ["C++", "Java", "Android", "iOS", "Unity", "SDK Design"]
   - Ignore: Generic terms like "Computer Science", "Algorithms",
     "Communication", "Teamwork".

3. **requirements**: Extract 5 to 10 distinct, atomic sentences that describe
   the ideal candidate.
   - Crucial: If the listing mentions specific Language Proficiencies (e.g.,
     "Advanced Chinese"), extract this as a separate requirement.
   - Crucial: Convert "Nice to have" or "Preferred" skills into positive
     requirement statements.
   - Crucial: Include educational requirements.
   - Format: "Proficiency in [Skill]", "Experience with [Task]",
     "Ability to [Action]".

4. **employment_type**: Infer the standardized type. Choose ONE: "Internship",
   "Full-time", "Contract", or "Part-time".
   - If the text says "3-6 month internship", output "Internship".

5. **location**: Extract the city and country.
   - Format: "City, Country" (e.g., "Singapore, Singapore" or "New York, USA").

6. **company**: Extract the company name.
   - Ensure it is the hiring company, not the recruitment agency (if applicable).

### INPUT JOB LISTING
{content}
"""

router = APIRouter(
  prefix='/listings',
  tags=['Listings'],
)


@router.get('', response_model=list[Listing])
async def get_listings():
  listings = listings_service.load_listings()
  return listings


@router.post('/scrape', response_model=ScrapeResult)
async def scrape_listings(urls: list[HttpUrl]):
  if not urls:
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='No URLs provided')

  # 1. Normalize all URLs and deduplicate
  normalized_urls = [normalize_url(url) for url in urls]
  unique_urls = list(dict.fromkeys(normalized_urls))

  # 2. Check which URLs already exist in database and mark as duplicates
  existing_listings = listings_service.get_listings_by_urls(unique_urls)
  existing_listings_map = {listing.url: listing for listing in existing_listings}

  duplicates = [
    DuplicateListing(listing=listing, duplicate_of=listing) for listing in existing_listings
  ]

  # 3. Scrape URLs not in database
  urls_to_scrape = [url for url in unique_urls if url not in existing_listings_map]

  page_contents = await asyncio.gather(
    *[scraping_service.fetch_and_clean(url) for url in urls_to_scrape]
  )

  llm_listings: list[LLMResponseListing] = await asyncio.gather(
    *[
      llm_service.call_structured(
        input=LISTING_EXTRACTION_PROMPT.format(content=content),
        response_model=LLMResponseListing,
      )
      for content in page_contents
    ]
  )

  scraped_listings: list[Listing] = [
    Listing(**llm_listing.model_dump(), url=url)
    for url, llm_listing in zip(urls_to_scrape, llm_listings, strict=False)
  ]

  # 4. Find similar/duplicate listings among newly scraped and mark as duplicates
  similar_duplicate_pairs = listings_service.find_similar_listings(scraped_listings)

  duplicates.extend(
    [
      DuplicateListing(listing=listing, duplicate_of=dup)
      for listing, dup in similar_duplicate_pairs
    ]
  )

  similar_duplicate_ids = {pair[0].id for pair in similar_duplicate_pairs}
  unique = [listing for listing in scraped_listings if listing.id not in similar_duplicate_ids]

  return ScrapeResult(unique=unique, duplicates=duplicates)


@router.post('')
async def save_listings(listings: list[Listing]):
  listings = listings_service.save_listings(listings)
  return listings
