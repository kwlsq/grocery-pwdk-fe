// src/app/auth/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';
import RedirectService from '@/services/redirectService';
import { LoginForm } from '@/components/form/login/LoginForm';
import { RegisterForm } from '@/components/form/register/RegisterForm';

export default function AuthPage() {
  const [view, setView] = useState<'login' | 'register'>('login');
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [hasRedirected, setHasRedirected] = useState(false);
   
  useEffect(() => {
    if (isAuthenticated && !hasRedirected) {
      setHasRedirected(true);
      
      // Check if there's a redirect parameter in URL (fallback)
      const redirectParam = searchParams.get('redirect');
      
      let redirectTo: string;
      
      if (redirectParam) {
        // Use URL parameter if available
        redirectTo = decodeURIComponent(redirectParam);
        console.log('Using URL redirect parameter:', redirectTo);
      } else {
        // Check if there's still a stored redirect (without clearing it first)
        const storedRedirect = RedirectService.getStoredRedirect();
        if (storedRedirect) {
          redirectTo = storedRedirect;
          // Now clear it since we're using it
          RedirectService.clearIntendedRedirect();
          console.log('Using stored redirect:', redirectTo);
        } else {
          redirectTo = '/';
          console.log('No stored redirect, using default:', redirectTo);
        }
      }
      
      console.log('Auth page redirecting to:', redirectTo);
      router.push(redirectTo);
    }
  }, [isAuthenticated, router, searchParams, hasRedirected]);

  // Show loading or nothing if already authenticated
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }
 
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10">
          {view === 'login' ? <LoginForm setView={setView} /> : <RegisterForm setView={setView} />}
        </div>
      </div>
    </div>
  );
}