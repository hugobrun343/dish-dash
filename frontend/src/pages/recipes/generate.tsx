import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/layout/Layout';
import { Loading } from '@/components/ui';
import { RecipeGeneratorForm } from '@/components/recipe/RecipeGeneratorForm';

export default function GenerateRecipePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, logout } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loading size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <Layout onLogout={handleLogout}>
      <div className="px-4 py-6 sm:px-0">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Generate Recipe
          </h1>
          <p className="text-lg text-gray-600">
            Create personalized recipes based on your ingredients and preferences
          </p>
        </div>

        {/* Recipe Generator Form */}
        <RecipeGeneratorForm />
      </div>
    </Layout>
  );
}
