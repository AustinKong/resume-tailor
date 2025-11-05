from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from app.routers import profile_router


class HealthRes(BaseModel):
  message: str


app = FastAPI()
app.add_middleware(
  CORSMiddleware,
  allow_origins=['http://localhost:5173'],
  allow_credentials=True,
  allow_methods=['*'],
  allow_headers=['*'],
)
app.include_router(profile_router.router)


@app.get('/health', response_model=HealthRes)
async def health_check():
  return {'message': 'OK'}


@app.middleware('http')
async def log_exceptions(request, call_next):
  try:
    return await call_next(request)
  except Exception as e:
    print(f'Exception occurred: {e}')
    return JSONResponse(
      status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
      content={'detail': 'Internal Server Error'},
    )
