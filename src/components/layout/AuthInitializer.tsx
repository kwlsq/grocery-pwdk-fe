'use client';

import { useEffect } from 'react';
import { useAuthStore } from '../../store/authStore'; 

export function AuthInitializer() {
  const { checkAuthStatus } = useAuthStore();

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  return null; 
}

