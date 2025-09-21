// src/hooks/useUserVerification.ts
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import RedirectService from '@/services/redirectService';

export function useUserVerification() {
  const { user, isAuthenticated, checkAuthStatus } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await checkAuthStatus();
      } catch (error) {
        console.error('Error in useUserVerification:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [checkAuthStatus]);

  const canAccessFeature = (requireAuth: boolean = false, requireVerification: boolean = false) => {
    if (requireAuth && !isAuthenticated) {
      return false;
    }
    
    if (requireVerification && (!isAuthenticated || !user?.verified)) {
      return false;
    }
    
    return true;
  };

  const redirectToAuthWithCurrentPage = () => {
    RedirectService.setIntendedRedirect(pathname);
    router.push('/auth');
  };

  const handleVerificationRequired = () => {
    if (!isAuthenticated) {
      redirectToAuthWithCurrentPage();
      return;
    }
    

    console.log('User needs to verify their account');
  };

  const requireAuth = (callback?: () => void) => {
    if (!isAuthenticated) {
      redirectToAuthWithCurrentPage();
      return false;
    }
    
    if (callback) callback();
    return true;
  };

  const requireVerification = (callback?: () => void) => {
    if (!isAuthenticated) {
      redirectToAuthWithCurrentPage();
      return false;
    }
    
    if (!user?.verified) {
      handleVerificationRequired();
      return false;
    }
    
    if (callback) callback();
    return true;
  };

  return {
    user,
    isAuthenticated,
    isRegistered: isAuthenticated, // Alias for navbar compatibility
    isVerified: user?.verified || false,
    isLoading,
    canAccessFeature,
    redirectToAuthWithCurrentPage,
    handleVerificationRequired,
    requireAuth,
    requireVerification
  };
}

export default useUserVerification;