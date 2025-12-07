"""
Prompt template for extracting job listing information using LLM.
"""

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

7. **domain**: Based on the company name and context,
   predict the company's official website domain (e.g., 'stripe.com', 'linear.app').
   If you are unsure, make your best guess based on the company name.
   Do not include 'https://' or 'www'.

### INPUT JOB LISTING
{content}
"""
