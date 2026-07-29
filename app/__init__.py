import sys
from pathlib import Path

# Resolve root directory and backend directory paths
root_dir = Path(__file__).resolve().parent.parent
backend_dir = root_dir / "backend"
backend_app_dir = backend_dir / "app"

# Ensure backend directory is in sys.path
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

# Extend package search path so app.core, app.api, app.services, app.main resolve from backend/app
if str(backend_app_dir) not in __path__:
    __path__.insert(0, str(backend_app_dir))
