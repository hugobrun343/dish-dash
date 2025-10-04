# 🍳 DishDash Backend API

FastAPI backend with Mistral AI integration for intelligent recipe generation.

## ✨ Features

- **🤖 Mistral AI Integration** : Generate 6 personalized recipes from ingredients
- **🔐 JWT Authentication** : Secure username-based authentication
- **💾 PostgreSQL Database** : Reliable data persistence
- **📊 User Preferences** : Dietary restrictions and allergies management
- **💾 Save System** : Save and manage favorite recipes
- **🔍 Recipe Details** : Full recipe information with ingredients and instructions
- **⚡ High Performance** : Fast API with async support
- **🧪 Comprehensive Testing** : Unit tests with pytest
- **📝 Type Safety** : Full TypeScript-like typing with Pydantic

## 🚀 Quick Start

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## 🏗️ Architecture

```
app/
├── core/           # Configuration, database, security
│   ├── config.py      # Environment settings
│   ├── database.py    # SQLAlchemy setup
│   └── security.py    # JWT authentication
├── models/         # SQLAlchemy ORM models
│   ├── user.py        # User and preferences
│   ├── recipe.py      # Recipe models
│   └── saved_recipe.py # Saved recipes
├── schemas/        # Pydantic validation schemas
│   ├── auth.py        # Authentication schemas
│   ├── user.py        # User schemas
│   └── recipe.py      # Recipe schemas
├── services/       # Business logic
│   ├── ai_service.py  # Mistral AI integration
│   ├── auth_service.py # Authentication logic
│   └── recipe_service.py # Recipe management
├── api/            # API routes
│   ├── v1/         # API version 1
│   │   ├── auth.py     # Authentication endpoints
│   │   ├── users.py    # User management
│   │   └── recipes.py  # Recipe endpoints
│   └── health.py   # Health checks
└── main.py         # FastAPI application
```

## 📡 API Endpoints

### Public
- `GET /` - API information and status
- `GET /health` - Health check with database connectivity test

### Authentication
- `POST /api/v1/auth/login` - Login with username (auto-creates user if new)

### Users (🔐 Authentication Required)
- `GET /api/v1/me` - Get current user profile
- `GET /api/v1/me/preferences` - Get user dietary preferences
- `PUT /api/v1/me/preferences` - Update dietary restrictions and allergies

### Recipes (🔐 Authentication Required)
- `POST /api/v1/recipes/generate` - Generate 6 recipes using Mistral AI
- `POST /api/v1/recipes/details` - Get full recipe details (ingredients + instructions)
- `GET /api/v1/recipes/saved` - Get all saved recipes
- `POST /api/v1/recipes/saved/{recipe_id}` - Save a recipe to favorites
- `DELETE /api/v1/recipes/saved/{recipe_id}` - Remove recipe from favorites

## 🛠️ Development

### Code Quality
```bash
# Linting with Ruff
ruff check app/ tests/ --fix

# Type checking with MyPy
mypy app/

# Run all quality checks
ruff check app/ tests/ && mypy app/ && pytest tests/
```

### Testing
```bash
# Run all tests
pytest tests/ -v

# Run with coverage
pytest tests/ --cov=app --cov-report=html

# Run specific test file
pytest tests/test_recipes.py -v
```

### Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Install dependencies
pip install -r requirements.txt

# Run development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## 🗄️ Database

- **Development**: PostgreSQL (Docker Compose)
- **Testing**: SQLite (in-memory, fast)
- **Production**: PostgreSQL (Dokku managed)

### Database Models
- **Users** : Username, preferences, timestamps
- **UserPreferences** : Dietary restrictions, allergies
- **Recipes** : AI-generated recipe data
- **SavedRecipes** : User's favorite recipes

## 🚀 Deployment

### Docker
```bash
# Build image
docker build -t ghcr.io/your-username/dishdash-backend:latest .

# Push to registry
docker push ghcr.io/your-username/dishdash-backend:latest

# Deploy with Dokku
ssh dokku@your-server "git:from-image your-app ghcr.io/your-username/dishdash-backend:latest"
```

### Environment Variables
```env
# Required
MISTRAL_API_KEY=your_mistral_api_key
DATABASE_URL=postgresql://user:pass@host:port/db
SECRET_KEY=your_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
ENVIRONMENT=production

# Optional
BACKEND_CORS_ORIGINS=https://your-frontend.com
```

## 📊 Dependencies

- **FastAPI** : Modern web framework
- **Mistral AI** : Recipe generation
- **SQLAlchemy** : ORM for database
- **PostgreSQL** : Primary database
- **Pydantic** : Data validation
- **JWT** : Authentication tokens
- **Pytest** : Testing framework
- **Ruff** : Code linting
- **MyPy** : Type checking
