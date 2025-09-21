'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';
import RedirectService from '@/services/redirectService';
import { LoginForm } from '@/components/form/login/LoginForm';
import { RegisterForm } from '@/components/form/register/RegisterForm';

export default function AuthPage() {
  const [view, setView] = useState<'login' | 'register'>('login');
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
   
  useEffect(() => {
    if (isAuthenticated) {
      const redirectTo = RedirectService.handlePostLoginRedirect();
      router.push(redirectTo);
    }
  }, [isAuthenticated, router]);
   
  if (isAuthenticated) {
    return null;
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