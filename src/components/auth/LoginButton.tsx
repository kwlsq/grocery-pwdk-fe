// src/components/auth/SmartLoginButton.tsx
'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import RedirectService from '@/services/redirectService';

interface SmartLoginButtonProps {
  className?: string;
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export function SmartLoginButton({ 
  className, 
  children, 
  variant = 'primary',
  size = 'md',
  onClick 
}: SmartLoginButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();

  const handleLoginClick = () => {
    // Execute custom onClick if provided
    if (onClick) {
      onClick();
    }
    
    // Store current page for redirect after login
    RedirectService.setIntendedRedirect(pathname);
    router.push('/auth');
  };

  // Don't render if user is already authenticated
  if (isAuthenticated) {
    return null;
  }

  // Base styles
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  // Size variants
  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };

  // Color variants
  const variantStyles = {
    primary: "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500",
    secondary: "bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500",
    outline: "border border-emerald-600 text-emerald-600 hover:bg-emerald-50 focus:ring-emerald-500"
  };

  const buttonClassName = className || `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]}`;

  return (
    <button
      onClick={handleLoginClick}
      className={buttonClassName}
    >
      {children || (
        <>
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
          Login
        </>
      )}
    </button>
  );
}

// Higher-order component for protecting features with login redirect
export function withLoginRedirect<P extends object>(
  Component: React.ComponentType<P>,
  message?: string
) {
  return function ProtectedComponent(props: P) {
    const { isAuthenticated } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();

    const handleLoginRedirect = () => {
      RedirectService.setIntendedRedirect(pathname);
      router.push('/auth');
    };

    if (!isAuthenticated) {
      return (
        <div className="text-center py-8">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Login Required</h3>
            <p className="text-gray-600 mb-6">
              {message || 'Please log in to access this feature'}
            </p>
            <button
              onClick={handleLoginRedirect}
              className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors font-medium inline-flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Login to Continue
            </button>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}

// Hook for login redirect functionality
export function useLoginRedirect() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();

  const redirectToLogin = (customPath?: string) => {
    const pathToStore = customPath || pathname;
    RedirectService.setIntendedRedirect(pathToStore);
    router.push('/auth');
  };

  return {
    isAuthenticated,
    redirectToLogin
  };
}