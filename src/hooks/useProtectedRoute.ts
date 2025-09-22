// src/hooks/useProtectedRoute.ts
'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import RedirectService from '@/services/redirectService';

interface ProtectedRouteOptions {
  requireAuth?: boolean;
  requireVerification?: boolean;
  allowedRoles?: string[];
  redirectOnRoleError?: string;
}

export function useProtectedRoute(options: ProtectedRouteOptions = {}) {
  const {
    requireAuth = true,
    requireVerification = false,
    allowedRoles = [],
    redirectOnRoleError = '/fallback'
  } = options;

  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, checkAuthStatus } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        await checkAuthStatus();
        const currentAuth = useAuthStore.getState().isAuthenticated;
        const currentUser = useAuthStore.getState().user;
        
        if (requireAuth && !currentAuth) {
          RedirectService.setIntendedRedirect(pathname);
          setShowAuthModal(true);
          setIsLoading(false);
          return;
        }

        if (currentAuth && allowedRoles.length > 0) {
          const userRole = currentUser?.role;
          if (!userRole || !allowedRoles.includes(userRole)) {
            setAccessDenied(true);
            setIsLoading(false);
            setTimeout(() => {
              router.push(redirectOnRoleError);
            }, 100);
            return;
          }
        }

        if (requireVerification && currentAuth && !currentUser?.verified) {
          setShowVerificationModal(true);
          setIsLoading(false);
          return;
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Auth check failed:', error);
        if (requireAuth) {
          RedirectService.setIntendedRedirect(pathname);
          setShowAuthModal(true);
        }
        setIsLoading(false);
      }
    };

    checkAccess();
  }, [requireAuth, requireVerification, allowedRoles, checkAuthStatus, router, redirectOnRoleError, pathname]);

  const handleGoToAuth = () => {
    setShowAuthModal(false);
    router.push('/auth');
  };

  const handleGoHome = () => {
    setShowAuthModal(false);
    RedirectService.clearIntendedRedirect();
    router.push('/');
  };

  const handleGoToVerification = () => {
    setShowVerificationModal(false);
    console.log('Resend verification email');
  };

  return {
    isLoading,
    isAuthenticated,
    user,
    isVerified: user?.verified || false,
    showAuthModal,
    showVerificationModal,
    accessDenied,
    handleGoToAuth,
    handleGoHome,
    handleGoToVerification
  };
}