'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const { user, isAuthenticated, checkAuthStatus } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const verifyAuth = async () => {
      try {
        await checkAuthStatus();
        setCheckingAuth(false);
      } catch (error) {
        setCheckingAuth(false);
        console.error(error);
      }
    };

    verifyAuth();
  }, [mounted, checkAuthStatus]);

  useEffect(() => {
    if (!mounted || checkingAuth) return;

    const allowed = isAuthenticated && user?.role !== 'CUSTOMER';
    
    if (!allowed) {
      router.push('/fallback');
    }
  }, [mounted, checkingAuth, user, isAuthenticated, router]);

  if (!mounted || checkingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role === 'CUSTOMER') {
    return null;
  }

  return <>{children}</>;
}
