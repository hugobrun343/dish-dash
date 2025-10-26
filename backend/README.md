# Backend API

FastAPI + Mistral AI + PostgreSQL

## Development

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Environment Variables

```env
MISTRAL_API_KEY=your_key
DATABASE_URL=postgresql://user:pass@host/db
SECRET_KEY=your_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

## Testing

```bash
pytest tests/ -v
```