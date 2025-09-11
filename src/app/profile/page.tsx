'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../store/authStore';
import { ProfileSidebar } from '@/components/profile/ProfileSidebar';
import { ProfileForm } from '@/components/form/profile/ProfileForm';

export default function UserProfilePage() {
    const { isAuthenticated, checkAuthStatus } = useAuthStore();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const check = async () => {
            await checkAuthStatus();
            setIsLoading(false);
        };
        check();
    }, [checkAuthStatus]);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/auth');
        }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <a href="/" className="text-2xl font-bold text-emerald-600">Grocereach</a>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <ProfileSidebar />
                    <div className="md:col-span-3">
                        <div className="bg-white p-8 rounded-2xl shadow-md">
                            <ProfileForm />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
