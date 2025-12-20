from fastapi import status
from fastapi.responses import JSONResponse


async def application_error_exception_handler(request, exc):
  return JSONResponse(
    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
    content={'detail': str(exc)},
  )
