import traceback

from dotenv import load_dotenv
from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

load_dotenv()

from app.routers import (  # noqa: E402
  experience_router,
  listings_router,
  profile_router,
  resume_router,
)

app = FastAPI()
app.add_middleware(
  CORSMiddleware,
  allow_origins=['http://localhost:5173'],
  allow_credentials=True,
  allow_methods=['*'],
  allow_headers=['*'],
)
app.include_router(profile_router.router)
app.include_router(experience_router.router)
app.include_router(listings_router.router)
app.include_router(resume_router.router)


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
