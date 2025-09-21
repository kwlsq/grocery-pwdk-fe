'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { resendVerificationEmail } from '@/services/authService';
import { GrocereachLogo } from '@/components/GrocereachLogo';
import { RefreshCw, Mail } from 'lucide-react';

interface ExpiredTokenFormProps {
  errorMessage: string;
}

const emailSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
});

export const ExpiredTokenForm: React.FC<ExpiredTokenFormProps> = ({ errorMessage }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  // Get email from URL parameters
  const emailFromUrl = searchParams.get('email') || '';

  const handleResendVerification = async (email: string) => {
    setIsResending(true);
    setResendMessage('');
    
    try {
      await resendVerificationEmail(email);
      setResendMessage('New verification email sent! Please check your inbox.');
    } catch (error: any) {
      if (error.response?.data) {
        setResendMessage(error.response.data);
      } else {
        setResendMessage('Failed to send verification email. Please try again.');
      }
    } finally {
      setIsResending(false);
      
      // Clear message after 5 seconds
      setTimeout(() => setResendMessage(''), 5000);
    }
  };

  return (
    <div className="w-full">
      <GrocereachLogo />
      <div className="text-center mt-4">
        <h2 className="text-2xl font-bold text-gray-900">Verification Link Expired</h2>
        <p className="text-gray-500 mt-1">Request a new verification link to continue</p>
      </div>
      {errorMessage && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-red-600 text-sm text-center">{errorMessage}</p>
        </div>
      )}
      {resendMessage && (
        <div className={`mt-4 border rounded-md p-3 ${
          resendMessage.includes('sent') 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <p className={`text-sm text-center ${
            resendMessage.includes('sent') ? 'text-green-600' : 'text-red-600'
          }`}>
            {resendMessage}
          </p>
        </div>
      )}

      <Formik
        initialValues={{ email: emailFromUrl }}
        validationSchema={emailSchema}
        onSubmit={async (values, { setSubmitting }) => {
          await handleResendVerification(values.email);
          setSubmitting(false);
        }}
      >
        {({ isSubmitting, errors, touched, values }) => (
          <Form className="mt-8 space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <Field 
                type="email" 
                name="email" 
                className={`mt-1 block w-full px-4 py-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 sm:text-sm ${
                  errors.email && touched.email 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-emerald-500'
                }`} 
                placeholder="Enter your email address"
                disabled={!!emailFromUrl} 
              />
              <ErrorMessage name="email" component="p" className="text-red-500 text-xs mt-1" />
              
              {emailFromUrl && (
                <p className="text-xs text-gray-500 mt-1">
                  Email address from your verification link
                </p>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={isSubmitting || isResending || !values.email || !!(errors.email && touched.email)}
                className="flex-1 inline-flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:bg-emerald-400 disabled:cursor-not-allowed"
              >
                {isSubmitting || isResending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Send New Link
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={() => router.push('/auth')}
                className="flex-1 inline-flex justify-center items-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              >
                Back to Login
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};