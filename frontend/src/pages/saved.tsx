import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/layout/Layout';
import { Card, CardHeader, CardTitle, Button, Loading, Input } from '@/components/ui';
import { BookmarkIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface SavedRecipe {
  id: string;
  recipe_id: number;
  user_id: number;
  saved_at: string;
  recipe: {
    id: number;
    name: string;
    description: string;
    prep_time: number;
    cooking_time: number;
    servings: number;
    difficulty: number;
    ingredients: Array<{ name: string; quantity: string }>;
    instructions: string;
    created_at: string;
    updated_at: string;
  };
}

export default function SavedRecipesPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<SavedRecipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingDetails, setLoadingDetails] = useState<string | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [isUnsaveing, setIsUnsaveing] = useState(false);
  const [error, setError] = useState('');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Load saved recipes
  useEffect(() => {
    if (isAuthenticated) {
      loadSavedRecipes();
    }
  }, [isAuthenticated]);

  // Filter recipes based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredRecipes(savedRecipes);
    } else {
      const filtered = savedRecipes.filter(recipe =>
        recipe.recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.recipe.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredRecipes(filtered);
    }
  }, [searchQuery, savedRecipes]);

  const loadSavedRecipes = async () => {
    setIsLoading(true);
    setError('');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        throw new Error('API URL not configured. Please set NEXT_PUBLIC_API_URL environment variable.');
      }
      const response = await fetch(`${apiUrl}/recipes/saved`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to load saved recipes: ${response.status}`);
      }

      const data = await response.json();
      setSavedRecipes(data || []);
    } catch (err) {
      console.error('Error loading saved recipes:', err);
      setError('Failed to load saved recipes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadRecipeDetails = async (recipeId: string, recipeName: string) => {
    setLoadingDetails(recipeId);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        throw new Error('API URL not configured. Please set NEXT_PUBLIC_API_URL environment variable.');
      }
      const response = await fetch(`${apiUrl}/recipes/details`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          recipe_name: recipeName,
          servings: 2,
          dietary_restrictions: []
        })
      });

      if (response.ok) {
        const detailsData = await response.json();

        // Create a recipe object with full details
        const fullRecipe = {
          id: detailsData.id.toString(),
          title: recipeName,
          description: detailsData.description || '',
          ingredients: detailsData.ingredients.map((ing: any) => `${ing.quantity} ${ing.name}`),
          instructions: detailsData.instructions.split('\n').filter((line: string) => line.trim()).map((line: string) => 
            line.replace(/^\d+\.\s*/, '') // Remove "1. ", "2. ", etc. from start of line
          ),
          prep_time: detailsData.prep_time || 0,
          cooking_time: detailsData.cooking_time || 0,
          servings: detailsData.servings,
          difficulty: detailsData.difficulty ? `${detailsData.difficulty}/10` : 'Unknown'
        };

        // Set the selected recipe and show popup
        setSelectedRecipe(fullRecipe);
        setShowPopup(true);
      }
    } catch (error) {
      console.error('Failed to load recipe details:', error);
    } finally {
      setLoadingDetails(null);
    }
  };

  const handleUnsaveRecipe = async (recipeId: string) => {
    setIsUnsaveing(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        throw new Error('API URL not configured. Please set NEXT_PUBLIC_API_URL environment variable.');
      }
      const response = await fetch(`${apiUrl}/recipes/saved/${recipeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        // Remove the recipe from the local state
        setSavedRecipes(prev => prev.filter(recipe => recipe.recipe.id.toString() !== recipeId));
        
        // Close popup if it's open for this recipe
        if (showPopup && selectedRecipe?.id === recipeId) {
          setShowPopup(false);
          setSelectedRecipe(null);
        }
        
        console.log('Recipe unsaved successfully!');
      } else {
        console.error('Failed to unsave recipe');
      }
    } catch (error) {
      console.error('Error unsaving recipe:', error);
    } finally {
      setIsUnsaveing(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loading size="lg" text="" />
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

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search your saved recipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Recipes Grid */}
        {filteredRecipes.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredRecipes.map((savedRecipe) => {
              const recipe = savedRecipe.recipe;
              return (
                <Card key={recipe.id} className="hover:shadow-lg transition-shadow h-full flex flex-col">
                 <CardHeader className="flex-shrink-0 pb-4 text-center">
                   <CardTitle className="text-lg line-clamp-2 mb-2">{recipe.name}</CardTitle>
                   <p className="text-sm text-gray-600 line-clamp-3">{recipe.description}</p>
                 </CardHeader>

                 <div className="px-6 pb-6 flex-1 flex flex-col">
                   {/* Recipe Info */}
                   <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                     <div className="text-center">
                       <div className="font-medium text-gray-900">{recipe.cooking_time} min</div>
                       <div className="text-gray-600 text-xs">Cook Time</div>
                     </div>
                     <div className="text-center">
                       <div className="font-medium text-gray-900">{recipe.difficulty}/10</div>
                       <div className="text-gray-600 text-xs">Difficulty</div>
                     </div>
                   </div>

                   {/* Saved Info */}
                   <div className="text-center mb-4">
                     <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                       <BookmarkIcon className="h-3 w-3 mr-1" />
                       Saved {formatDate(savedRecipe.saved_at)}
                     </span>
                   </div>

                   {/* Action Button at bottom */}
                   <div className="mt-auto">
                     <Button
                       className="w-full"
                       onClick={() => handleLoadRecipeDetails(recipe.id.toString(), recipe.name)}
                       disabled={loadingDetails === recipe.id.toString()}
                     >
                       {loadingDetails === recipe.id.toString() ? (
                         <Loading size="sm" text="" />
                       ) : (
                         'View Recipe Details'
                       )}
                     </Button>
                   </div>
                 </div>
               </Card>
             );
           })}
          </div>
       ) : (
         <div className="text-center py-12">
           <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
             <BookmarkIcon className="h-12 w-12 text-gray-400" />
           </div>
           <h3 className="text-xl font-semibold text-gray-900 mb-4">
             No saved recipes found
           </h3>
           <p className="text-gray-600 mb-6">
             {searchQuery ? `No recipes match "${searchQuery}"` : 'You haven\'t saved any recipes yet.'}
           </p>
           {searchQuery ? (
             <button
               onClick={() => setSearchQuery('')}
               className="text-blue-600 hover:text-blue-700 font-medium"
             >
               Clear search
             </button>
           ) : (
             <Button onClick={() => router.push('/recipes/generate')}>
               Generate Recipes
             </Button>
           )}
         </div>
       )}

       {/* Recipe Details Popup */}
       {showPopup && selectedRecipe && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
           <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
             <div className="flex justify-between items-center p-6 border-b flex-shrink-0">
               <h2 className="text-2xl font-bold text-gray-900">{selectedRecipe.title}</h2>
               <button
                 onClick={() => setShowPopup(false)}
                 className="text-gray-400 hover:text-gray-600"
               >
                 <XMarkIcon className="h-6 w-6" />
               </button>
             </div>

             <div className="p-6 overflow-y-auto flex-1">
               <p className="text-gray-600 mb-6">{selectedRecipe.description}</p>

               {/* Recipe Info */}
               <div className="grid grid-cols-3 gap-4 mb-6">
                 <div className="text-center p-3 bg-gray-50 rounded-lg">
                   <div className="font-medium text-gray-900">{selectedRecipe.cooking_time} min</div>
                   <div className="text-sm text-gray-600">Cook Time</div>
                 </div>
                 <div className="text-center p-3 bg-gray-50 rounded-lg">
                   <div className="font-medium text-gray-900">{selectedRecipe.servings}</div>
                   <div className="text-sm text-gray-600">Servings</div>
                 </div>
                 <div className="text-center p-3 bg-gray-50 rounded-lg">
                   <div className="font-medium text-gray-900">{selectedRecipe.difficulty}</div>
                   <div className="text-sm text-gray-600">Difficulty</div>
                 </div>
               </div>

               {/* Ingredients */}
               <div className="mb-6">
                 <h3 className="text-lg font-semibold text-gray-900 mb-3">Ingredients</h3>
                 <ul className="space-y-2">
                    {selectedRecipe.ingredients.map((ingredient: string, index: number) => (
                     <li key={index} className="flex items-center space-x-2">
                       <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                       <span>{ingredient}</span>
                     </li>
                   ))}
                 </ul>
               </div>

               {/* Instructions */}
               <div className="mb-6">
                 <h3 className="text-lg font-semibold text-gray-900 mb-3">Instructions</h3>
                 <ol className="space-y-3">
                    {selectedRecipe.instructions.map((instruction: string, index: number) => (
                     <li key={index} className="flex space-x-3">
                       <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                         {index + 1}
                       </span>
                       <span className="text-gray-700">{instruction}</span>
                     </li>
                   ))}
                 </ol>
               </div>
             </div>

             <div className="flex justify-between items-center p-6 border-t bg-gray-50 flex-shrink-0">
               <p className="text-xs text-gray-500 italic">
                 Recipe generated by Mistral AI
               </p>
               <Button
                 onClick={() => handleUnsaveRecipe(selectedRecipe.id)}
                 disabled={isUnsaveing}
                 variant="secondary"
                 className="bg-red-50 text-red-700 hover:bg-red-100"
               >
                 {isUnsaveing ? (
                   <Loading size="sm" text="" />
                 ) : (
                   'Unsave Recipe'
                 )}
               </Button>
             </div>
           </div>
         </div>
       )}
     </div>
    </Layout>
  );
}

 // Helper function to format savedAt date
 function formatDate(dateString: string): string {
   const options: Intl.DateTimeFormatOptions = {
     year: 'numeric',
     month: 'short',
     day: 'numeric',
     hour: '2-digit',
     minute: '2-digit'
   };
   return new Date(dateString).toLocaleDateString(undefined, options);
 }