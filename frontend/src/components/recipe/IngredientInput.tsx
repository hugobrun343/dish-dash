import React, { forwardRef } from 'react';
import { Input } from '@/components/ui';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface IngredientInputProps {
  value: string;
  onChange: (value: string) => void;
  onRemove?: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

export const IngredientInput = forwardRef<HTMLInputElement, IngredientInputProps>(
  ({ value, onChange, onRemove, onKeyDown }, ref) => {
    return (
      <div className="flex items-center space-x-3">
        <Input
          ref={ref}
          type="text"
          placeholder="Enter an ingredient (e.g., chicken, tomatoes, pasta)"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          className="flex-1"
        />
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors border border-gray-200 hover:border-gray-300"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}
      </div>
    );
  }
);

IngredientInput.displayName = 'IngredientInput';
