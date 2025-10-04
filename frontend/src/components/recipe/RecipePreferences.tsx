import React from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui';

interface RecipePreferencesProps {
  cookingTime: string;
  setCookingTime: (time: string) => void;
  difficulty: string;
  setDifficulty: (difficulty: string) => void;
}

export function RecipePreferences({
  cookingTime,
  setCookingTime,
  difficulty,
  setDifficulty
}: RecipePreferencesProps) {

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cooking Preferences</CardTitle>
      </CardHeader>
      
      <div className="p-6 space-y-6">
        {/* Cooking Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cooking Time
          </label>
          <select
            value={cookingTime}
            onChange={(e) => setCookingTime(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Any time</option>
            <option value="15">Quick (15 minutes)</option>
            <option value="30">Moderate (30 minutes)</option>
            <option value="45">Standard (45 minutes)</option>
            <option value="60">Extended (1 hour)</option>
            <option value="90">Long (1.5+ hours)</option>
          </select>
        </div>

        {/* Difficulty */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Difficulty Level
          </label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Any level</option>
            <option value="1">Beginner (1-3)</option>
            <option value="4">Intermediate (4-6)</option>
            <option value="7">Advanced (7-10)</option>
          </select>
        </div>

      </div>
    </Card>
  );
}
