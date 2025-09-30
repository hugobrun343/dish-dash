# Backend - DishDash API

FastAPI backend with Mistral AI integration.

## Setup

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## API Endpoints

- `GET /` - Health check
- `POST /auth/login` - Simple username login
- `POST /recipes/generate` - Generate recipe list from ingredients with Mistral
- `POST /recipes/details` - Get detailed recipe from recipe name with Mistral
- `GET /recipes/saved` - Get user saved recipes
- `POST /recipes/saved` - Save a recipe
- `DELETE /recipes/saved/{recipe_id}` - Delete a saved recipe

## Database

- **Development**: PostgreSQL with clean tables
- **Test**: PostgreSQL for automated testing
- **Production**: PostgreSQL for production deployment
