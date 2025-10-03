import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/layout/Layout';
import { Card, CardHeader, CardTitle, Loading } from '@/components/ui';
import { BookmarkIcon } from '@heroicons/react/24/outline';

export default function SavedRecipesPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();

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
        <Loading size="lg" text="Loading..." />
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
            Saved Recipes
          </h1>
          <p className="text-lg text-gray-600">
            Your collection of favorite recipes
          </p>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <BookmarkIcon className="h-6 w-6 text-blue-500" />
              </div>
              <CardTitle>Your Saved Recipes</CardTitle>
            </div>
          </CardHeader>
          
          <div className="p-8 text-center">
            <div className="mx-auto h-24 w-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
              <BookmarkIcon className="h-12 w-12 text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              No saved recipes yet
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Start generating recipes and save your favorites to see them here!
            </p>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
