// src/app/auth/page.tsx
'use client';

import React, { useState, Suspense } from 'react';
import { useAuthStore } from '../../store/authStore';
import { LoginForm } from '@/components/form/login/LoginForm';
import { RegisterForm } from '@/components/form/register/RegisterForm';
import { AuthRedirectHandler } from '@/components/auth/AuthRedirectHandler';

export default function AuthPage() {
  const [view, setView] = useState<'login' | 'register'>('login');
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirecting...</p>
          <Suspense fallback={null}>
            <AuthRedirectHandler />
          </Suspense>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Suspense fallback={null}>
        <AuthRedirectHandler />
      </Suspense>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10">
          {view === 'login' ? <LoginForm setView={setView} /> : <RegisterForm setView={setView} />}
        </div>
      </div>
    </div>
  );
}