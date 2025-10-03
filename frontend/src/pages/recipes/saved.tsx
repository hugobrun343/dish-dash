import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useRecipes } from '@/contexts/RecipeContext';
import { useAuth } from '@/hooks/useAuth';
import { Button, Card, CardContent } from '@/components/ui';
import { RecipeGrid, FilterPanel, SearchBar } from '@/components';
import { useRecipeFiltering } from '@/hooks/useRecipeFiltering';
import { PlusIcon, HeartIcon } from '@heroicons/react/24/outline';

export default function SavedRecipesPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { 
    savedRecipes, 
    loadSavedRecipes, 
    isLoading, 
    filters, 
    setFilters, 
    clearFilters,
    unsaveRecipe 
  } = useRecipes();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isRemoving, setIsRemoving] = useState<string | null>(null);

  const { filteredRecipes, hasActiveFilters } = useRecipeFiltering(savedRecipes, filters);

  useEffect(() => {
    if (isAuthenticated) {
      loadSavedRecipes();
    }
  }, [isAuthenticated, loadSavedRecipes]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setFilters({ search: value });
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ [key]: value });
  };

  const handleRemoveFilter = (key: string) => {
    setFilters({ [key]: '' });
  };

  const handleUnsaveRecipe = async (recipeId: string) => {
    setIsRemoving(recipeId);
    try {
      await unsaveRecipe(recipeId);
    } catch (error) {
      console.error('Error removing recipe:', error);
    } finally {
      setIsRemoving(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">
            Login Required
          </h2>
          <p className="text-neutral-600 mb-6">
            You must be logged in to view your saved recipes
          </p>
          <Button onClick={() => router.push('/auth/login')}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            My Saved Recipes
          </h1>
          <p className="text-neutral-600">
            {filteredRecipes.length} recipe{filteredRecipes.length !== 1 ? 's' : ''} found
          </p>
        </div>
        
        <div className="flex gap-3">
          <Link href="/recipes/generate">
            <Button variant="primary">
              <PlusIcon className="w-4 h-4 mr-2" />
              New Recipe
            </Button>
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <SearchBar
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Search your recipes..."
          onToggleFilters={() => setShowFilters(!showFilters)}
        />

        <FilterPanel
          filters={filters}
          onFilterChange={handleFilterChange}
          onRemoveFilter={handleRemoveFilter}
          onClearFilters={clearFilters}
          isVisible={showFilters}
        />
      </div>

      {/* Recipes Grid */}
      <RecipeGrid
        recipes={filteredRecipes}
        isLoading={isLoading}
        onUnsave={handleUnsaveRecipe}
        isRemoving={isRemoving}
        emptyState={
          <Card className="p-12 text-center">
            <CardContent>
              <div className="w-16 h-16 bg-neutral-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <HeartIcon className="w-8 h-8 text-neutral-400" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                {hasActiveFilters ? 'No recipes found' : 'No saved recipes'}
              </h3>
              <p className="text-neutral-600 mb-6">
                {hasActiveFilters 
                  ? 'Try modifying your filters to see more results'
                  : 'Start by generating and saving your first recipes!'
                }
              </p>
              {hasActiveFilters ? (
                <Button variant="outline" onClick={clearFilters}>
                  Clear filters
                </Button>
              ) : (
                <Link href="/recipes/generate">
                  <Button variant="primary">
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Create Recipe
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        }
      />
    </div>
  );
}
