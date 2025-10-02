'use client';

import React, { useState } from 'react';
import { Mail, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { resendVerificationEmail } from '@/services/authService';
import { AxiosError } from 'axios';

export const VerificationBanner = () => {
  const { user, isAuthenticated } = useAuthStore();
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  // Don't show banner if user is verified or not logged in
  if (!isAuthenticated || !user || user.verified) {
    return null;
  }

  const handleResendVerification = async () => {
    setIsResending(true);
    setResendMessage('');

    try {
      await resendVerificationEmail(user.email);
      setResendMessage('Verification email sent! Please check your inbox.');
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      if (error.response?.data?.message) {
        setResendMessage(error.response.data.message);
      } else {
        setResendMessage('Network error. Please try again.');
      }
    } finally {
      setIsResending(false);

      // Clear message after 5 seconds
      setTimeout(() => setResendMessage(''), 5000);
    }
  };

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-400 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-amber-600" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-amber-600" />
                <p className="text-sm font-medium text-amber-800">
                  Please verify your email address
                </p>
              </div>
              <p className="text-xs text-amber-700 mt-1">
                We sent a verification link to <span className="font-medium">{user.email}</span>
              </p>

              {resendMessage && (
                <p className={`text-xs mt-1 font-medium ${resendMessage.includes('sent') ? 'text-green-600' : 'text-red-600'
                  }`}>
                  {resendMessage}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center">
            <button
              onClick={handleResendVerification}
              disabled={isResending}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-amber-800 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isResending ? (
                <>
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="h-3 w-3 mr-1" />
                  Resend Email
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};