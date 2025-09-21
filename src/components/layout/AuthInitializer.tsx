'use client';

import { useEffect } from 'react';
import { useAuthStore } from '../../store/authStore'; 

export function AuthInitializer() {
  const { checkAuthStatus, authChecked } = useAuthStore();

  useEffect(() => {
    if (!authChecked) {
      checkAuthStatus();
    }
  }, [checkAuthStatus, authChecked]);

  return null; 
}