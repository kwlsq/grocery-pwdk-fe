'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import RedirectService from '@/services/redirectService';

export function AuthRedirectHandler() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !hasRedirected) {
      setHasRedirected(true);
      const redirectParam = searchParams.get('redirect');
      
      let redirectTo: string;
      
      if (redirectParam) {
        redirectTo = decodeURIComponent(redirectParam);
        console.log('Using URL redirect parameter:', redirectTo);
      } else {
        const storedRedirect = RedirectService.getStoredRedirect();
        if (storedRedirect) {
          redirectTo = storedRedirect;
          RedirectService.clearIntendedRedirect();
          console.log('Using stored redirect:', redirectTo);
        } else {
          redirectTo = '/';
        }
      }
      
      router.push(redirectTo);
    }
  }, [isAuthenticated, router, searchParams, hasRedirected]);

  return null;
}