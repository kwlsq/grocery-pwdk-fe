'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import RedirectService from '@/services/redirectService';

interface UseUserVerificationOptions {
  requireVerified?: boolean;
  protectedPaths?: string[];
  redirectTo?: string;
  usePopup?: boolean;
  skipRedirectPaths?: string[]; 
  customMessages?: {
    loginRequired?: string;
    verificationRequired?: string;
  };
  onAccessDenied?: (reason: 'login' | 'verification') => void;
}

interface PopupState {
  show: boolean;
  message: string;
  type: 'warning' | 'error' | 'info';
}

export const useUserVerification = (options: UseUserVerificationOptions = {}) => {
  const {
    requireVerified = false,
    protectedPaths = ['/profile', '/cart', '/checkout'],
    redirectTo = '/',
    usePopup = true,
    skipRedirectPaths = ['/auth', '/login', '/register'],
    customMessages = {},
    onAccessDenied
  } = options;

  const { user, isAuthenticated, authChecked } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  
  const [popup, setPopup] = useState<PopupState>({ 
    show: false, 
    message: '', 
    type: 'warning' 
  });

  // Memoized computed values
  const isRegistered = isAuthenticated && user;
  const isVerified = isRegistered && user?.verified;
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
  const shouldSkipRedirect = skipRedirectPaths.some(path => pathname.includes(path));

  // Memoized popup handler
  const handlePopupConfirm = useCallback(() => {
    setPopup({ show: false, message: '', type: 'warning' });
    // Only redirect if it's a protected path
    if (isProtectedPath) {
      router.push(redirectTo);
    }
  }, [isProtectedPath, redirectTo, router]);

  // Enhanced utility functions with better typing
  const canAccessFeature = useCallback((
    requiresAuth = true, 
    requiresVerification = false
  ): boolean => {
    if (!requiresAuth) return true;
    if (!isRegistered) return false;
    if (requiresVerification && !isVerified) return false;
    return true;
  }, [isRegistered, isVerified]);

  const getDisabledReason = useCallback((
    requiresAuth = true, 
    requiresVerification = false
  ): string | null => {
    if (!requiresAuth) return null;
    if (!isRegistered) return customMessages.loginRequired || 'Please login first';
    if (requiresVerification && !isVerified) return customMessages.verificationRequired || 'Please verify your account';
    return null;
  }, [isRegistered, isVerified, customMessages]);

  // New utility: Check access with detailed response
  const checkAccess = useCallback((
    requiresAuth = true,
    requiresVerification = false
  ) => {
    const hasAccess = canAccessFeature(requiresAuth, requiresVerification);
    const reason = getDisabledReason(requiresAuth, requiresVerification);
    
    return {
      hasAccess,
      reason,
      needsLogin: requiresAuth && !isRegistered,
      needsVerification: requiresVerification && isRegistered && !isVerified
    };
  }, [canAccessFeature, getDisabledReason, isRegistered, isVerified]);

  // Enhanced main effect with better error handling
  useEffect(() => {
    if (!authChecked) return;

    try {
      if (!isRegistered) {
        // Save redirect destination for non-auth pages
        if (!shouldSkipRedirect) {
          const currentPath = pathname + (typeof window !== 'undefined' ? window.location.search : '');
          RedirectService.saveIntendedRedirect(currentPath);
        }
        
        // Handle protected path access
        if (isProtectedPath) {
          onAccessDenied?.('login');
          
          if (usePopup) {
            setPopup({
              show: true,
              message: customMessages.loginRequired || 'You need to be logged in to access this page',
              type: 'warning'
            });
          } else {
            setTimeout(() => router.push(redirectTo), 1000);
          }
        }
        return;
      }

      // Handle verification requirements
      if (isProtectedPath && requireVerified && !isVerified) {
        onAccessDenied?.('verification');
        
        if (usePopup) {
          setPopup({
            show: true,
            message: customMessages.verificationRequired || 'Please verify your account to access this page',
            type: 'error'
          });
        } else {
          setTimeout(() => router.push('/verify-account'), 1000);
        }
      }
    } catch (error) {
      console.error('Error in useUserVerification:', error);
      // Fallback to safe state
      setPopup({
        show: true,
        message: 'An error occurred. Please try again.',
        type: 'error'
      });
    }
  }, [
    authChecked,
    isRegistered,
    isVerified,
    isProtectedPath,
    pathname,
    router,
    redirectTo,
    requireVerified,
    usePopup,
    shouldSkipRedirect,
    customMessages,
    onAccessDenied
  ]);

  // New helper: Force redirect with optional delay
  const forceRedirect = useCallback((
    path: string = redirectTo,
    delay: number = 0
  ) => {
    if (delay > 0) {
      setTimeout(() => router.push(path), delay);
    } else {
      router.push(path);
    }
  }, [router, redirectTo]);

  // New helper: Show custom popup
  const showPopup = useCallback((
    message: string,
    type: PopupState['type'] = 'info'
  ) => {
    setPopup({ show: true, message, type });
  }, []);

  return {
    // Original returns
    isRegistered,
    isVerified,
    popup,
    handlePopupConfirm,
    canAccessFeature,
    getDisabledReason,
    
    // New returns
    checkAccess,
    forceRedirect,
    showPopup,
    isProtectedPath,
    authChecked
  };
};