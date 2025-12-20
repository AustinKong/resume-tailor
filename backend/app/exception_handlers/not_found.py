from fastapi import status
from fastapi.responses import JSONResponse


async def not_found_exception_handler(request, exc):
  return JSONResponse(
    status_code=status.HTTP_404_NOT_FOUND,
    content={'detail': str(exc)},
  )
