'use client';

import React from 'react';
import { ProfileSidebar } from '@/components/profile/ProfileSidebar';
import { ProfileForm } from '@/components/form/profile/ProfileForm';
import Navbar from '@/components/Navbar/Index';

export default function UserProfilePage() {
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