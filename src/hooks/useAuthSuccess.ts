'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import RedirectService from '@/services/redirectService';
import { User } from '@/types/user';

export const useAuthSuccess = () => {
    const router = useRouter();
    const { login } = useAuthStore();

    const handleLoginSuccess = (userData: User) => {
        login(userData);
        const redirectTo = RedirectService.handlePostLoginRedirect();
        setTimeout(() => {
            router.push(redirectTo);
        }, 100);
    };

    const handleRegisterSuccess = (userData: User) => {
        handleLoginSuccess(userData);
    };

    return {
        handleLoginSuccess,
        handleRegisterSuccess
    };
};