import traceback

from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.routers import (
  config_router,
  experiences_router,
  listings_router,
  profile_router,
  resumes_router,
)
from app.utils.errors import (
  ApplicationError,
  NotFoundError,
  ServiceError,
)

app = FastAPI()
app.add_middleware(
  CORSMiddleware,
  allow_origins=['http://localhost:5173'],
  allow_credentials=True,
  allow_methods=['*'],
  allow_headers=['*'],
)
app.include_router(profile_router)
app.include_router(experiences_router)
app.include_router(listings_router)
app.include_router(resumes_router)
app.include_router(config_router)


@app.exception_handler(NotFoundError)
async def not_found_exception_handler(request, exc):
  return JSONResponse(
    status_code=status.HTTP_404_NOT_FOUND,
    content={'detail': str(exc)},
  )


@app.exception_handler(ServiceError)
async def service_error_exception_handler(request, exc):
  return JSONResponse(
    status_code=status.HTTP_400_BAD_REQUEST,
    content={'detail': str(exc)},
  )


@app.exception_handler(ApplicationError)
async def application_error_exception_handler(request, exc):
  return JSONResponse(
    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
    content={'detail': str(exc)},
  )


@app.get('/health')
async def health_check():
  return {'message': 'OK'}


@app.middleware('http')
async def log_exceptions(request, call_next):
  try:
    return await call_next(request)
  except Exception as e:
    print(f'Exception occurred: {e}')
    traceback.print_exc()
    return JSONResponse(
      status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
      content={'detail': 'Internal Server Error'},
    )
