import traceback

from fastapi import Request
from fastapi.responses import JSONResponse


async def exception_logging_middleware(request: Request, call_next):
  try:
    return await call_next(request)
  except Exception as e:
    print(f'Exception occurred: {e}')
    traceback.print_exc()
    return JSONResponse(
      status_code=500,
      content={'detail': 'Internal Server Error'},
    )
