from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


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


@app.get('/health', response_model=HealthRes)
async def health_check():
  return {'message': 'OK'}
