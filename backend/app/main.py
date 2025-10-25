from fastapi import FastAPI
from pydantic import BaseModel


class HealthRes(BaseModel):
  message: str


app = FastAPI()


@app.get('/health', response_model=HealthRes)
async def health_check():
  return {'message': 'OK'}
