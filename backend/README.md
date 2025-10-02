# Backend - DishDash API

FastAPI backend with Mistral AI integration for recipe generation.

## Quick Start

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Architecture

```
app/
├── core/           # Configuration, database, security
├── models/         # SQLAlchemy ORM models
├── schemas/        # Pydantic validation schemas
├── services/       # Business logic
├── api/            # API routes
│   ├── v1/         # API version 1
│   │   ├── auth.py     # Authentication
│   │   └── recipes.py  # Recipe management
│   └── health.py   # Health checks
└── main.py         # FastAPI application
```

## API Endpoints

### Public
- `GET /` - API info
- `GET /health` - Health check (with database test)

### Authentication
- `POST /api/v1/auth/login` - Login with username (creates user if doesn't exist)

### Recipes (requires authentication)
- `POST /api/v1/recipes/generate` - Generate recipe list from ingredients using AI
- `POST /api/v1/recipes/details` - Get detailed recipe with AI
- `GET /api/v1/recipes/saved` - Get saved recipes
- `POST /api/v1/recipes/saved/{recipe_id}` - Save a recipe
- `DELETE /api/v1/recipes/saved/{recipe_id}` - Unsave a recipe

## Development

### Run linters
```bash
ruff check app/ tests/
```

### Run type checking
```bash
python -m mypy app/
```

### Run tests
```bash
pytest tests/ -v
```

### Run all checks
```bash
ruff check app/ tests/ && mypy app/ && pytest tests/
```

## Database

- **Development**: PostgreSQL (Docker)
- **Tests**: SQLite (in-memory, fast)
- **Production**: PostgreSQL (configured via env vars)
