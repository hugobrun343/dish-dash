# 🍳 DishDash Frontend

Modern, clean and professional frontend for DishDash - AI-powered recipe generation with Mistral.

## ✨ Features

- **🎨 Complete Design System** : Consistent UI components with Tailwind CSS
- **🔐 Simplified Authentication** : Username-only login system
- **🤖 AI Generation** : Mistral AI integration for personalized recipes
- **💾 Save System** : Favorites system for recipes
- **🔍 Search & Filters** : Advanced search and recipe filtering
- **📱 Responsive** : Mobile-first optimized design
- **⚡ Performance** : Fast loading and smooth animations
- **🧩 Modular Architecture** : Clean, reusable components and custom hooks

## 🚀 Technologies

- **Next.js 14** - React framework with SSR
- **TypeScript** - Static typing
- **Tailwind CSS** - Utility-first CSS framework
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **Axios** - HTTP client
- **Framer Motion** - Animations
- **Heroicons** - Icons

## 📦 Installation

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

## 🎨 Design System

### Colors
- **Primary** : Orange (#F97316) - Kitchen, warmth
- **Secondary** : Red (#DC2626) - Appetite, passion  
- **Accent** : Yellow (#F59E0B) - Spicy, gourmet
- **Neutral** : Gray (#6B7280) - Text, borders

### Components
- `Button` - Buttons with variants (primary, secondary, outline, ghost)
- `Input` - Input fields with validation
- `Card` - Cards with header, content, footer
- `Badge` - Colored badges for tags
- `Loading` - Loading states and skeletons
- `Modal` - Modals and toasts

## 📱 Pages

### 🏠 Home (`/`)
- Hero section with compelling title
- Quick generation form
- Recent recipes preview
- Call-to-action for login

### 🔐 Authentication (`/auth/login`)
- Simple username form
- Zod validation
- Redirect after login

### 🍳 Recipe Generation (`/recipes/generate`)
- Detailed form with:
  - Ingredients (input with tags)
  - Dietary restrictions
  - Cooking time (slider)
  - Number of servings
  - Difficulty level
- Loading state during AI generation

### 📖 Recipe Detail (`/recipes/[id]`)
- Complete recipe display
- Save/remove from favorites button
- Preparation and cooking time
- Difficulty (stars)
- Step-by-step instructions
- Ingredients list with quantities
- Actions: share, print

### 💾 Saved Recipes (`/recipes/saved`)
- List of saved recipes
- Advanced filters and search
- Preview cards
- Quick actions (view, remove from favorites)

### 👤 Profile (`/profile`)
- User information
- Culinary statistics
- Generated recipes history
- Dietary preferences

## 🏗️ Architecture

### Component Structure
```
src/components/
├── common/           # Reusable UI components
├── recipe/           # Recipe-specific components
├── profile/          # Profile-specific components
├── home/            # Home page components
└── ui/              # Base UI components
```

### Custom Hooks
```
src/hooks/
├── useProfileStats.ts
├── useRecipeGeneration.ts
├── useIngredientManagement.ts
├── useDietaryRestrictions.ts
├── useQuickGeneration.ts
└── useRecipeFiltering.ts
```

## 🔧 Configuration

### Environment Variables
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### API Endpoints
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/recipes/generate` - Recipe generation
- `GET /api/v1/recipes/{id}` - Recipe details
- `POST /api/v1/recipes/{id}/save` - Save recipe
- `DELETE /api/v1/recipes/{id}/save` - Remove from favorites
- `GET /api/v1/recipes/saved` - Saved recipes

## 🎯 Advanced Features

### State Management
- **AuthContext** : Authentication and user
- **RecipeContext** : Recipe management and filters
- **ToastContext** : User notifications

### Validation
- **Zod** for form validation
- **React Hook Form** for state management
- Client and server-side validation

### UX/UI
- **Loading States** : Skeletons and spinners
- **Error Handling** : Graceful error management
- **Responsive Design** : Mobile-first approach
- **Animations** : Smooth transitions with Framer Motion

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Docker
```bash
# Build image
docker build -t dishdash-frontend .

# Run container
docker run -p 3000:3000 dishdash-frontend
```

## 📈 Performance

- **Code Splitting** : On-demand loading
- **Image Optimization** : Optimized images with Next.js
- **Bundle Analysis** : Bundle size analysis
- **Lighthouse Score** : Performance optimized

## 🧪 Testing

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
```

## 📝 Scripts

```bash
npm run dev          # Development
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint linting
npm run type-check   # TypeScript checking
```

## 🤝 Contributing

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for more details.

---

**DishDash** - Transform your fridge into a creative kitchen! 🍳✨