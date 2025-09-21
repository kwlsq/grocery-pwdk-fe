'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import RedirectService from '@/services/redirectService';

export const useAuthSuccess = () => {
    const router = useRouter();
    const { login } = useAuthStore();

    const handleLoginSuccess = (userData: any) => {
        login(userData);
        const redirectTo = RedirectService.handlePostLoginRedirect();
        setTimeout(() => {
            router.push(redirectTo);
        }, 100);
    };

    const handleRegisterSuccess = (userData: any) => {
        handleLoginSuccess(userData);
    };

    return {
        handleLoginSuccess,
        handleRegisterSuccess
    };
};