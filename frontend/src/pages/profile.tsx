import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/layout/Layout';
import { Card, CardHeader, CardTitle, Loading, Button } from '@/components/ui';
import { UserIcon, CogIcon } from '@heroicons/react/24/outline';

export default function ProfilePage() {
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
            Profile
          </h1>
          <p className="text-lg text-gray-600">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Profile Info */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <UserIcon className="h-6 w-6 text-blue-500" />
              </div>
              <CardTitle>Account Information</CardTitle>
            </div>
          </CardHeader>
          
          <div className="p-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-blue-500">
                  {user?.username?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {user?.username}
                </h3>
                <p className="text-gray-600">
                  Member since {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          
          <div className="p-6">
            <div className="space-y-4">
              <Link href="/preferences">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-blue-700 mb-2">Preferences</h3>
                      <p className="text-blue-600 text-sm">
                        Customize your cooking preferences and dietary restrictions.
                      </p>
                    </div>
                    <CogIcon className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </Card>

        {/* Logout Section */}
        <Card>
          <CardHeader>
            <CardTitle>Account Actions</CardTitle>
          </CardHeader>
          
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Sign Out</h3>
                <p className="text-gray-600 text-sm">
                  Sign out of your account
                </p>
              </div>
              <Button
                variant="secondary"
                onClick={handleLogout}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
