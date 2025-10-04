import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Card, CardHeader, CardTitle, Button, Input, Loading } from '@/components/ui';
import { SparklesIcon, PlusIcon, XMarkIcon, CogIcon } from '@heroicons/react/24/outline';
import { IngredientInput } from './IngredientInput';
import { RecipePreferences } from './RecipePreferences';
import { usePreferences } from '@/hooks/usePreferences';

export function RecipeGeneratorForm() {
  const router = useRouter();
  const { preferences } = usePreferences();
  const [ingredients, setIngredients] = useState<string[]>(['']);
  const [cookingTime, setCookingTime] = useState<string>('');
  const [difficulty, setDifficulty] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [focusIndex, setFocusIndex] = useState<number | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const addIngredient = () => {
    setIngredients([...ingredients, '']);
  };

  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };

  const updateIngredient = (index: number, value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = value;
    setIngredients(newIngredients);
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Add new ingredient after current one
      const newIngredients = [...ingredients];
      newIngredients.splice(index + 1, 0, '');
      setIngredients(newIngredients);
      // Focus on the new input
      setFocusIndex(index + 1);
    }
  };

  // Focus effect
  useEffect(() => {
    if (focusIndex !== null) {
      // Use setTimeout to ensure the DOM is updated
      setTimeout(() => {
        if (inputRefs.current[focusIndex]) {
          inputRefs.current[focusIndex]?.focus();
        }
        setFocusIndex(null);
      }, 0);
    }
  }, [focusIndex, ingredients.length]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    const validIngredients = ingredients.filter(ing => ing.trim());
    if (validIngredients.length === 0) {
      setError('Please add at least one ingredient');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Call real API to generate recipe
      const requestData = {
        ingredients: validIngredients,
        cookingTime,
        difficulty,
        dietaryRestrictions: preferences?.dietary_restrictions || [],
        allergies: preferences?.allergies || []
      };
      
      console.log('🔍 Recipe generation request:', requestData);
      console.log('🔍 User preferences:', preferences);
      
      // Call the real Mistral API using apiClient
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) {
          throw new Error('API URL not configured. Please set NEXT_PUBLIC_API_URL environment variable.');
        }
        const response = await fetch(`${apiUrl}/recipes/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          },
          body: JSON.stringify({
            ingredients: validIngredients,
            cooking_time: cookingTime ? parseInt(cookingTime) : null,
            difficulty: difficulty ? parseInt(difficulty) : null,
            servings: 2,
            dietary_restrictions: preferences?.dietary_restrictions || []
          })
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Auth failed: ${response.status} ${response.statusText} - ${errorText}`);
        }
        
        const data = await response.json();
        console.log('✅ Real API response:', data);
      } catch (error) {
        console.error('❌ API call failed:', error);
        throw error;
      }
      
      // Redirect to results page with generated recipes
      router.push({
        pathname: '/recipes/results',
        query: {
          ingredients: validIngredients.join(','),
          dietaryRestrictions: (preferences?.dietary_restrictions || []).join(','),
          allergies: (preferences?.allergies || []).join(',')
        }
      });
      
    } catch (error) {
      // Check if it's a Mistral API quota exceeded error
      if (error instanceof Error && error.message.includes('3505') && error.message.includes('service_tier_capacity_exceeded')) {
        setError('API quota temporarily exceeded. Please try again in a few minutes.');
      } else if (error instanceof Error && error.message.includes('429')) {
        setError('Too many requests. Please wait a moment before trying again.');
      } else {
        setError('Failed to generate recipe. Please try again.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <form onSubmit={handleGenerate} className="space-y-6">
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* User Dietary Preferences */}
         <Card>
           <CardHeader>
             <div className="flex items-center justify-between">
               <div className="flex items-center space-x-3">
                 <div className="h-10 w-10 bg-green-50 rounded-lg flex items-center justify-center">
                   <CogIcon className="h-6 w-6 text-green-500" />
                 </div>
                 <CardTitle>Your Dietary Preferences</CardTitle>
               </div>
               <Button
                 type="button"
                 variant="secondary"
                 size="sm"
                 onClick={() => router.push('/preferences')}
               >
                 Edit Preferences
               </Button>
             </div>
           </CardHeader>
           
           <div className="p-6">
             <div className="space-y-4">
               {/* Dietary Restrictions */}
               <div>
                 <h4 className="text-sm font-medium text-gray-700 mb-2">Dietary Restrictions</h4>
                 {preferences?.dietary_restrictions && preferences.dietary_restrictions.length > 0 ? (
                   <div className="flex flex-wrap gap-2">
                     {preferences.dietary_restrictions.map((restriction) => (
                       <span
                         key={restriction}
                         className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                       >
                         {restriction}
                       </span>
                     ))}
                   </div>
                 ) : (
                   <p className="text-gray-500 text-sm">No dietary restrictions set</p>
                 )}
               </div>

               {/* Allergies */}
               <div>
                 <h4 className="text-sm font-medium text-gray-700 mb-2">Allergies</h4>
                 {preferences?.allergies && preferences.allergies.length > 0 ? (
                   <div className="flex flex-wrap gap-2">
                     {preferences.allergies.map((allergy) => (
                       <span
                         key={allergy}
                         className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full"
                       >
                         {allergy}
                       </span>
                     ))}
                   </div>
                 ) : (
                   <p className="text-gray-500 text-sm">No allergies set</p>
                 )}
               </div>
             </div>
           </div>
         </Card>

         {/* Recipe Preferences Section */}
         <RecipePreferences
           cookingTime={cookingTime}
           setCookingTime={setCookingTime}
           difficulty={difficulty}
           setDifficulty={setDifficulty}
         />
       </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800">{success}</p>
        </div>
      )}

      {/* Ingredients Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <SparklesIcon className="h-6 w-6 text-blue-500" />
            </div>
            <CardTitle>Ingredients</CardTitle>
          </div>
        </CardHeader>
        
        <div className="p-6 space-y-4">
          {ingredients.map((ingredient, index) => (
            <IngredientInput
              key={index}
              value={ingredient}
              onChange={(value) => updateIngredient(index, value)}
              onRemove={ingredients.length > 1 ? () => removeIngredient(index) : undefined}
              onKeyDown={(e) => handleKeyDown(e, index)}
              ref={(el) => { inputRefs.current[index] = el; }}
            />
          ))}
          
          <button
            type="button"
            onClick={addIngredient}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Add another ingredient</span>
          </button>
        </div>
      </Card>

      {/* Generate Button */}
      <div className="flex justify-center">
        <Button
          type="submit"
          disabled={isGenerating}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
                {isGenerating ? (
                  <Loading size="sm" text="" />
                ) : (
                  <div className="flex items-center space-x-2">
                    <SparklesIcon className="h-5 w-5" />
                    <span>Generate Recipe</span>
                  </div>
                )}
        </Button>
      </div>
    </form>
  );
}
