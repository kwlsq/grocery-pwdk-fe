'use client';

import React from 'react';
import { ProfileSidebar } from '@/components/profile/ProfileSidebar';
import { ProfileForm } from '@/components/form/profile/ProfileForm';
import { useProtectedRoute } from '@/hooks/useProtectedRoute'; // Import the hook

export default function UserProfilePage() {
    const { isLoading, isAuthenticated  } = useProtectedRoute();
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