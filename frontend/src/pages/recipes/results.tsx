import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/layout/Layout';
import { Card, CardHeader, CardTitle, Button, Loading } from '@/components/ui';
import { ArrowLeftIcon, SparklesIcon, XMarkIcon } from '@heroicons/react/24/outline';


interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prep_time: number;
  cook_time: number;
  servings: number;
  difficulty: string;
}

export default function RecipeResultsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState<string | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedRecipeIds, setSavedRecipeIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState('');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Load recipes from API based on query parameters
  useEffect(() => {
    if (router.isReady && isAuthenticated) {
      const { ingredients, dietaryRestrictions, allergies } = router.query;
      
      console.log('🔍 Results page - Query params:', { ingredients, dietaryRestrictions, allergies });
      
      const ingredientList = ingredients ? (ingredients as string).split(',') : [];
      const restrictions = dietaryRestrictions ? (dietaryRestrictions as string).split(',') : [];
      const allergyList = allergies ? (allergies as string).split(',') : [];
      
      console.log('🔍 Parsed data:', { ingredientList, restrictions, allergyList });
      
      // Call the real API to get recipe details
      loadRecipeDetails(ingredientList, restrictions, allergyList);
    }
  }, [router.isReady, router.query, isAuthenticated]);

  const loadRecipeDetails = async (ingredients: string[], restrictions: string[], allergies: string[]) => {
    setIsLoading(true);
    setError('');
    
    try {
      // First, get recipe suggestions from the generate endpoint
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        throw new Error('API URL not configured. Please set NEXT_PUBLIC_API_URL environment variable.');
      }
      const generateResponse = await fetch(`${apiUrl}/recipes/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          ingredients,
          servings: 2,
          dietary_restrictions: restrictions
        })
      });
      
      if (!generateResponse.ok) {
        throw new Error(`Failed to generate recipes: ${generateResponse.status}`);
      }
      
      const generateData = await generateResponse.json();
      console.log('🍳 Generated recipe suggestions:', generateData);
      
      // Convert API suggestions to Recipe objects (without details)
      const recipes: Recipe[] = generateData.recipes.map((recipeSuggestion: any) => ({
        id: Math.random().toString(), // Temporary ID
        title: recipeSuggestion.name,
        description: recipeSuggestion.description || '',
        ingredients: ['Not loaded yet'], // Will load when user clicks "View Details"
        instructions: ['Not loaded yet'], // Will load when user clicks "View Details"
        prep_time: 0, // Will load when user clicks "View Details"
        cook_time: recipeSuggestion.cooking_time || 0,
        servings: 2,
        difficulty: recipeSuggestion.difficulty ? `${recipeSuggestion.difficulty}/10` : 'Unknown'
      }));
      
      console.log('✅ Recipes without details:', recipes);
      setRecipes(recipes);
      
    } catch (err) {
      console.error('❌ Error loading recipes:', err);
      setError('Failed to load recipes. Please try again.');
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
        const fullRecipe: Recipe = {
          id: detailsData.id.toString(), // Use real recipe ID from database
          title: recipeName,
          description: detailsData.description || '',
          ingredients: detailsData.ingredients.map((ing: any) => `${ing.quantity} ${ing.name}`),
          instructions: detailsData.instructions.split('\n').filter((line: string) => line.trim()).map((line: string) => 
            line.replace(/^\d+\.\s*/, '') // Remove "1. ", "2. ", etc. from start of line
          ),
          prep_time: detailsData.prep_time || 0,
          cook_time: detailsData.cooking_time || 0,
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

  const handleSaveRecipe = async (recipeId: string) => {
    setIsSaving(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        throw new Error('API URL not configured. Please set NEXT_PUBLIC_API_URL environment variable.');
      }
      const response = await fetch(`${apiUrl}/recipes/saved/${recipeId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        // Add to saved recipes set
        setSavedRecipeIds(prev => new Set(Array.from(prev).concat(recipeId)));
        console.log('Recipe saved successfully!');
      } else {
        console.error('Failed to save recipe');
      }
    } catch (error) {
      console.error('Error saving recipe:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUnsaveRecipe = async (recipeId: string) => {
    setIsSaving(true);

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
        // Remove from saved recipes set
        setSavedRecipeIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(recipeId);
          return newSet;
        });
        console.log('Recipe unsaved successfully!');
      } else {
        console.error('Failed to unsave recipe');
      }
    } catch (error) {
      console.error('Error unsaving recipe:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  const handleBackToGenerator = () => {
    router.push('/recipes/generate');
  };

  if (authLoading || isLoading) {
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Generated Recipes
              </h1>
              <p className="text-base sm:text-lg text-gray-600">
                Here are your personalized recipes based on your ingredients and preferences
              </p>
            </div>
            <div className="flex-shrink-0">
              <Button
                variant="secondary"
                onClick={handleBackToGenerator}
                className="flex items-center space-x-2 w-full sm:w-auto"
              >
                <ArrowLeftIcon className="h-5 w-5" />
                <span>Generate More</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Recipes Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {recipes.map((recipe) => (
            <Card key={recipe.id} className="hover:shadow-lg transition-shadow h-full flex flex-col">
              <CardHeader className="flex-shrink-0 pb-4 text-center">
                <CardTitle className="text-lg line-clamp-2 mb-2">{recipe.title}</CardTitle>
                <p className="text-sm text-gray-600 line-clamp-3">{recipe.description}</p>
              </CardHeader>
              
              <div className="px-6 pb-6 flex-1 flex flex-col">
                {/* Recipe Info */}
                <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                  <div className="text-center">
                    <div className="font-medium text-gray-900">{recipe.cook_time} min</div>
                    <div className="text-gray-600 text-xs">Cook Time</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-gray-900">{recipe.difficulty}</div>
                    <div className="text-gray-600 text-xs">Difficulty</div>
                  </div>
                </div>

                {/* Action Button at bottom */}
                <div className="mt-auto">
                  <Button 
                    className="w-full"
                    onClick={() => handleLoadRecipeDetails(recipe.id, recipe.title)}
                    disabled={loadingDetails === recipe.id}
                  >
                    {loadingDetails === recipe.id ? (
                      <Loading size="sm" text="" />
                    ) : (
                      'View Recipe Details'
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* No Recipes Message */}
        {recipes.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <SparklesIcon className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              No recipes found
            </h3>
            <p className="text-gray-600 mb-6">
              We couldn&apos;t generate any recipes with your current ingredients.
            </p>
            <Button onClick={handleBackToGenerator}>
              Try Different Ingredients
            </Button>
          </div>
        )}
      </div>

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
                  <div className="font-medium text-gray-900">{selectedRecipe.cook_time} min</div>
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
                  {selectedRecipe.ingredients.map((ingredient, index) => (
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
                  {selectedRecipe.instructions.map((instruction, index) => (
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
                   onClick={() => {
                     const isSaved = savedRecipeIds.has(selectedRecipe.id);
                     if (isSaved) {
                       handleUnsaveRecipe(selectedRecipe.id);
                     } else {
                       handleSaveRecipe(selectedRecipe.id);
                     }
                   }}
                   disabled={isSaving}
                    variant="primary"
                   className={savedRecipeIds.has(selectedRecipe.id) ? "bg-red-50 text-red-700 hover:bg-red-100" : "bg-blue-300 hover:bg-blue-500 text-white"}
                 >
                   {isSaving ? (
                     <Loading size="sm" text="" />
                   ) : savedRecipeIds.has(selectedRecipe.id) ? (
                     'Unsave Recipe'
                   ) : (
                     'Save Recipe'
                   )}
                 </Button>
               </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
