'use client';

import React, { useState, useEffect } from 'react';
import { VerifyForm } from '@/components/form/verify/VerifyForm';
import { ExpiredTokenForm } from '@/components/form/expired-token';
import { useParams, useRouter } from 'next/navigation';
import { checkVerificationToken } from '@/services/authService';
import { GrocereachLogo } from '@/components/GrocereachLogo';
import { Loader, CheckCircle, XCircle } from 'lucide-react';

export default function VerifyPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
  const [isCheckingToken, setIsCheckingToken] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setErrorMessage('No verification token found. Please check your link.');
        setIsTokenValid(false);
        setIsCheckingToken(false);
        return;
      }

      try {
        await checkVerificationToken(token);
        setIsTokenValid(true);
      } catch (err: any) {
        const errorMessage = err.response?.data || 'Token validation failed.';
        setIsTokenValid(false);
        setErrorMessage(errorMessage);
      } finally {
        setIsCheckingToken(false);
      }
    };

    validateToken();
  }, [token]);

  // Loading state while checking token
  if (isCheckingToken) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10">
            <GrocereachLogo />
            <div className="text-center mt-4">
              <h2 className="text-2xl font-bold text-gray-900">Verifying Token</h2>
              <p className="text-gray-500 mt-1">Please wait while we validate your verification link...</p>
            </div>
            <div className="flex justify-center items-center mt-8">
              <Loader className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10">
          {isTokenValid ? (
            <>
              {/* Valid Token - Show Password Form */}
              <div className="flex justify-center mb-4">
                <div className="flex items-center text-green-600">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  <span className="text-sm">Valid verification link</span>
                </div>
              </div>
              <VerifyForm token={token} />
            </>
          ) : (
            <>
              {/* Invalid/Expired Token - Show Resend Form */}
              <div className="flex justify-center mb-4">
                <div className="flex items-center text-red-600">
                  <XCircle className="h-5 w-5 mr-2" />
                  <span className="text-sm">Invalid or expired link</span>
                </div>
              </div>
              <ExpiredTokenForm errorMessage={errorMessage} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}