
'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/authStore'; 
import { LoginForm } from '@/components/form/login/LoginForm';
import { RegisterForm } from '@/components/form/register/RegisterForm';

export default function AuthPage() {
  const [view, setView] = useState<'login' | 'register'>('login');
  const { isAuthenticated, checkAuthStatus } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

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
