import sys
import webbrowser
from pathlib import Path
from threading import Timer

import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from app.main import create_app
from app.seed import create_tables

app = create_app()

app.add_middleware(
  CORSMiddleware,
  allow_origins=['http://localhost:5173'],
  allow_credentials=True,
  allow_methods=['*'],
  allow_headers=['*'],
)


if getattr(sys, 'frozen', False):
  base_path = Path(getattr(sys, '_MEIPASS'))  # noqa: B009
  dist_path = base_path / 'frontend' / 'dist'
else:
  dist_path = Path(__file__).parent.parent / 'frontend' / 'dist'

if dist_path.exists():
  app.mount('/assets', StaticFiles(directory=str(dist_path / 'assets')), name='assets')

  @app.get('/{full_path:path}')
  async def serve_ui(full_path: str):
    # Prevent UI from swallowing API 404s
    if full_path.startswith('api'):
      return JSONResponse(status_code=404, content={'detail': 'API Route Not Found'})
    return FileResponse(str(dist_path / 'index.html'))


def open_browser():
  webbrowser.open_new('http://127.0.0.1:8000')


if __name__ == '__main__':
  create_tables()

  if getattr(sys, 'frozen', False):
    Timer(1.5, open_browser).start()

  uvicorn.run(
    'run:app',
    host='127.0.0.1',
    port=8000,
    log_level='info',
    reload=True,
    reload_dirs=[str(Path(__file__).parent)],
  )
