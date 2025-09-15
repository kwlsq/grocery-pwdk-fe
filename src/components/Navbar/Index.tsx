"use client"

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore'
const UserIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
);
const LogOutIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
);
const ShoppingCartIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" /></svg>
);
export default function Navbar(){
   
    const { isAuthenticated, user, logout } = useAuthStore();
    
    const router = useRouter();



    const handleLogout = async () => {
        await logout();
        router.push('/');
    };

    return (
        <header className="bg-white shadow-md sticky top-0 z-50">
            <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex-shrink-0">
                        <Link href="/" className="text-2xl font-bold text-emerald-600">
                            Grocereach
                        </Link>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button className="p-2 rounded-full hover:bg-gray-100">
                            <ShoppingCartIcon className="h-6 w-6 text-gray-600" />
                        </button>
                        {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
                            <Link href="/admin-dashboard" className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700">
                                Admin Dashboard
                            </Link>
                        )}
                        {isAuthenticated ? (
                            <>
                                <span className="text-gray-700 hidden sm:block">Hello, {user?.fullName?.split(' ')[0]}</span>
                                <button onClick={handleLogout} className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                                    <LogOutIcon className="h-5 w-5" />
                                    <span>Logout</span>
                                </button>
                            </>
                        ) : (
                            <Link href="/auth" className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700">
                                Login / Sign Up
                            </Link>
                        )}
                    </div>
                </div>
            </nav>
        </header>
    );
};
