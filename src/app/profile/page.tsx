// src/app/profile/page.tsx
'use client';

import React from 'react';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { ProfileSidebar } from '@/components/profile/ProfileSidebar';
import { ProfileForm } from '@/components/form/profile/ProfileForm';
import { AuthRequiredModal } from '@/components/auth/AuthRequiredModal';
import Navbar from '@/components/Navbar/Index';

export default function UserProfilePage() {
    const { 
        isLoading, 
        isAuthenticated, 
        showAuthModal, 
        handleGoToAuth, 
        handleGoHome,
        accessDenied 
    } = useProtectedRoute({
        requireAuth: true,
        requireVerification: false, 
        allowedRoles: ['CUSTOMER']
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (accessDenied) {
        return null;
    }

    if (!isAuthenticated) {
        return (
            <AuthRequiredModal 
                isOpen={showAuthModal}
                onGoToAuth={handleGoToAuth}
                onGoHome={handleGoHome}
                pageName="your profile"
            />
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar/>
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