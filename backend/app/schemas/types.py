from typing import Annotated

from pydantic import StringConstraints

# Shared type for year-month strings in YYYY-MM format
YearMonth = Annotated[str, StringConstraints(pattern=r'^\d{4}-\d{2}$')]
