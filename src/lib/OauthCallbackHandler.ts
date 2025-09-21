'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import RedirectService from '@/services/redirectService';

export const OAuthCallbackHandler = () => {
  const router = useRouter();
  const { checkAuthStatus } = useAuthStore();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Check if user is now authenticated after OAuth
        await checkAuthStatus();
        
        // Get redirect path from session storage and redirect
        const redirectTo = RedirectService.handlePostLoginRedirect();
        
        // Small delay to ensure auth state is updated
        setTimeout(() => {
          router.push(redirectTo);
        }, 500);
        
      } catch (error) {
        console.error('OAuth callback error:', error);
        // Redirect to login on error
        router.push('/login');
      }
    };

    handleOAuthCallback();
  }, [router, checkAuthStatus]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
};