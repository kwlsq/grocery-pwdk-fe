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
        
        // Check authentication
        if (requireAuth && !currentAuth) {
          // Store current page for redirect after login
          RedirectService.setIntendedRedirect(pathname);
          setShowAuthModal(true);
          setIsLoading(false);
          return;
        }

        // Check role permissions
        if (currentAuth && allowedRoles.length > 0) {
          const userRole = currentUser?.role;
          if (!userRole || !allowedRoles.includes(userRole)) {
            setAccessDenied(true);
            setIsLoading(false);
            // Redirect to fallback page for role errors
            setTimeout(() => {
              router.push(redirectOnRoleError);
            }, 100);
            return;
          }
        }

        // Check verification if required
        if (requireVerification && currentAuth && !currentUser?.verified) {
          setShowVerificationModal(true);
          setIsLoading(false);
          return;
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Auth check failed:', error);
        if (requireAuth) {
          // Store current page for redirect after login
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
    // Clear any stored redirect since user chose to go home
    RedirectService.clearIntendedRedirect();
    router.push('/');
  };

  const handleGoToVerification = () => {
    setShowVerificationModal(false);
    // You can implement resend verification logic here
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