'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export const useProtectedRoute = () => {
    const { isAuthenticated } = useAuthStore();
    const router = useRouter();
    const [isAuthChecked, setIsAuthChecked] = useState(false);

    useEffect(() => {
        const isLoggedIn = useAuthStore.getState().isAuthenticated;

        if (!isLoggedIn) {
            const timer = setTimeout(() => {
                if (!useAuthStore.getState().isAuthenticated) {
                   alert(" You are not logged in ")
                    router.push('/'); 
                } else {
                    setIsAuthChecked(true);
                }
            }, 2000); 
            return () => clearTimeout(timer);
        } else {
            setIsAuthChecked(true);
        }
    }, [isAuthenticated, router]);

    return { isLoading: !isAuthChecked, isAuthenticated };
};
