// src/components/Navbar/Index.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useUserVerification } from '@/hooks/useUserVerification';
import { VerificationBanner } from '../user/EmailVerificationBanner';
import { SmartLoginButton } from '../auth/LoginButton';
import RedirectService from '@/services/redirectService';
import Image from 'next/image';

const LogOutIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
);

const ShoppingCartIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" /></svg>
);

export default function Navbar() {
    const { isAuthenticated, user, logout } = useAuthStore();
    const { isVerified } = useUserVerification();
    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = async () => {
        RedirectService.clearIntendedRedirect();
        await logout();
        router.push('/');
    };

    const handleCartClick = () => {
        if (!isAuthenticated) {
            // Store current page and redirect to auth
            RedirectService.setIntendedRedirect(pathname);
            router.push('/auth');
            return;
        }

        if (!isVerified) {
            // Show some feedback that verification is needed
            alert('Please verify your email to access the cart');
            return;
        }

        // Navigate to cart
        router.push('/cart');
    };

    const renderCartButton = () => {
        if (!isAuthenticated) {
            return (
                <button
                    onClick={handleCartClick}
                    className="p-2 rounded-full hover:bg-gray-100 relative transition-colors"
                    title="Login to access cart"
                >
                    <ShoppingCartIcon className="h-6 w-6 text-gray-400" />
                </button>
            );
        }

        if (!isVerified) {
            return (
                <button
                    onClick={handleCartClick}
                    className="p-2 rounded-full hover:bg-gray-100 relative transition-colors"
                    title="Verify account to access cart"
                >
                    <ShoppingCartIcon className="h-6 w-6 text-gray-400" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">!</span>
                    </div>
                </button>
            );
        }

        return (
            <Link href="/cart" className="p-2 rounded-full hover:bg-gray-100 relative transition-colors">
                <ShoppingCartIcon className="h-6 w-6 text-gray-600" />
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 text-white text-xs rounded-full flex items-center justify-center">
                    3
                </div>
            </Link>
        );
    };

    const renderProfileSection = () => {
        if (!isAuthenticated) {
            return (
                <SmartLoginButton variant="primary" size="sm">
                    Login / Sign Up
                </SmartLoginButton>
            );
        }

        return (
            <div className="flex items-center space-x-4">
                <Link href="/profile" className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="relative h-8 w-8">
                        <Image
                            src={
                                user?.photoUrl ||
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName ?? "U")}&background=random`
                            }
                            alt="Profile"
                            fill
                            className="rounded-full object-cover"
                        />
                        {!isVerified && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full"></div>
                        )}
                    </div>
                    <div className="hidden sm:block">
                        <span className="text-gray-700">Hello, {user?.fullName?.split(' ')[0]}</span>
                        {!isVerified && (
                            <div className="text-xs text-yellow-600">Not Verified</div>
                        )}
                    </div>
                </Link>

                <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 p-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                    title="Logout"
                >
                    <LogOutIcon className="h-5 w-5" />
                </button>
            </div>
        );
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
                        {renderCartButton()}

                        {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
                            <Link
                                href="/admin-dashboard"
                                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                            >
                                Admin Dashboard
                            </Link>
                        )}

                        {renderProfileSection()}
                    </div>
                </div>
            </nav>
            <VerificationBanner />
        </header>
    );
}