import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import { Button, Input, Card, CardHeader, CardTitle, Loading } from '@/components/ui';
import { UserIcon } from '@heroicons/react/24/outline';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading } = useAuth();
  const [username, setUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await login(username.trim());
      router.push('/');
    } catch (error) {
      setError('Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loading size="lg" text="Loading..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card className="shadow-lg border border-blue-100">
          <CardHeader>
            <div className="text-center">
              <div className="mx-auto h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <UserIcon className="h-6 w-6 text-blue-500" />
              </div>
              <CardTitle className="text-2xl text-center text-gray-800">
                Welcome to DishDash
              </CardTitle>
              <p className="mt-2 text-sm text-gray-500 text-center">
                Sign in to your account to get started
              </p>
            </div>
          </CardHeader>
          
          <form className="space-y-6" onSubmit={handleLogin}>
            <Input
              label="Username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isSubmitting}
              error={error}
              icon={<UserIcon />}
              autoComplete="username"
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              disabled={!username.trim()}
              className="w-full"
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}