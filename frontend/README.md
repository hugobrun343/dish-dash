# 🍳 DishDash Frontend

Next.js frontend for AI-powered recipe generation.

## 🚀 Tech Stack

- **Next.js 14** + **TypeScript** + **Tailwind CSS**
- **React Hook Form** + **Zod** validation
- **Heroicons** for icons

## 📦 Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🧪 Quality Checks

```bash
# Linting
npm run lint

# Type checking
npm run type-check

# Build check
npm run build
```

## 🔧 Configuration

```env
NEXT_PUBLIC_API_URL=https://your-backend-url.com/api/v1
```

## 🚀 Deployment

```bash
# Build and push
docker build -t ghcr.io/your-username/dishdash-frontend:latest .
docker push ghcr.io/your-username/dishdash-frontend:latest

# Deploy with Dokku
ssh dokku@your-server "git:from-image your-app ghcr.io/your-username/dishdash-frontend:latest"
```