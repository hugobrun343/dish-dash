import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import { usePreferences, UserPreferences } from '@/hooks/usePreferences';
import { Layout } from '@/components/layout/Layout';
import { Card, CardHeader, CardTitle, Button, Input, Loading } from '@/components/ui';
import { CogIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

const DIETARY_OPTIONS = [
  'vegetarian',
  'vegan',
  'gluten-free',
  'dairy-free',
  'keto',
  'paleo',
  'low-carb',
  'halal',
  'kosher',
];

const ALLERGY_OPTIONS = [
  'nuts',
  'dairy',
  'eggs',
  'shellfish',
  'fish',
  'soy',
  'wheat',
  'sesame',
];



export default function PreferencesPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const { preferences, isLoading, error, updatePreferences } = usePreferences();
  const [formData, setFormData] = useState<Partial<UserPreferences>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Initialize form data when preferences load
  useEffect(() => {
    if (preferences) {
      setFormData(preferences);
    }
  }, [preferences]);

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    
    const success = await updatePreferences(formData);
    
    if (success) {
      setMessage({ type: 'success', text: 'Preferences updated successfully!' });
    } else {
      setMessage({ type: 'error', text: 'Failed to update preferences. Please try again.' });
    }
    
    setIsSubmitting(false);
  };

  const handleArrayChange = (field: keyof UserPreferences, value: string, checked: boolean) => {
    const currentArray = (formData[field] as string[]) || [];
    const newArray = checked
      ? [...currentArray, value]
      : currentArray.filter(item => item !== value);
    
    setFormData(prev => ({
      ...prev,
      [field]: newArray,
    }));
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Preferences
              </h1>
              <p className="text-lg text-gray-600">
                Customize your cooking preferences and dietary restrictions
              </p>
            </div>
            <Button
              variant="secondary"
              onClick={() => router.push('/profile')}
              className="flex items-center space-x-2"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              <span>Back to Profile</span>
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {message && (
          <div className={`mb-6 p-4 rounded-lg border ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <p className={message.type === 'success' ? 'text-green-700' : 'text-red-700'}>
              {message.text}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Dietary Restrictions */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Dietary Restrictions</CardTitle>
            </CardHeader>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {DIETARY_OPTIONS.map(option => (
                  <label key={option} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={(formData.dietary_restrictions || []).includes(option)}
                      onChange={(e) => handleArrayChange('dietary_restrictions', option, e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 capitalize">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          </Card>

          {/* Allergies */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Allergies</CardTitle>
            </CardHeader>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {ALLERGY_OPTIONS.map(option => (
                  <label key={option} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={(formData.allergies || []).includes(option)}
                      onChange={(e) => handleArrayChange('allergies', option, e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 capitalize">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          </Card>



          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Preferences'}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
