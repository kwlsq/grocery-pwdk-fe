// This is the updated code for src/app/verify/[token]/page.tsx

'use client'; // <-- Make the whole page a client component

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation'; // <-- Import useParams
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

// --- Axios API Client ---
const apiClient = axios.create({
  baseURL: 'http://localhost:8080',
  withCredentials: true,
});

// --- Yup Validation Schema ---
const verifySchema = Yup.object().shape({
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
});

// --- SVG Logo Component ---
const GrocereachLogo = () => (
    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500">
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" />
            <path d="M12 5v14" />
        </svg>
    </div>
);


// --- Main Page Component ---
// It now uses the useParams hook
export default function VerifyPage() {
  const router = useRouter();
  const params = useParams(); // <-- Use the hook here
  const token = params.token as string; // Get the token from the params object

  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!token) {
      setServerError('No verification token found. Please check your link.');
    }
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10">
          <div className="w-full">
            <GrocereachLogo />
            <div className="text-center mt-4">
              <h2 className="text-2xl font-bold text-gray-900">Set Your Password</h2>
              <p className="text-gray-500 mt-1">Complete your account setup.</p>
            </div>

            <Formik
              initialValues={{ password: '', confirmPassword: '' }}
              validationSchema={verifySchema}
              onSubmit={async (values, { setSubmitting }) => {
                if (!token) {
                  setServerError('Verification token is missing.');
                  setSubmitting(false);
                  return;
                }
                setServerError('');
                setSuccess('');
                setIsExpired(false);
                try {
                  const response = await apiClient.post('/api/auth/verify', {
                    token,
                    password: values.password,
                  });
                  setSuccess(response.data + " Redirecting to login...");
                  setTimeout(() => {
                    router.push('/auth');
                  }, 2000);
                } catch (err: any) {
                  const errorMessage = err.response?.data || 'Verification failed.';
                  setServerError(errorMessage);
                  if (errorMessage.toLowerCase().includes('expired')) {
                    setIsExpired(true);
                  }
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {({ isSubmitting, errors, touched }) => (
                <Form className="mt-8 space-y-6">
                  {serverError && <p className="text-red-500 bg-red-100 p-3 rounded-md text-sm text-center">{serverError}</p>}
                  {success && <p className="text-green-600 bg-green-100 p-3 rounded-md text-sm text-center">{success}</p>}
                  
                  {isExpired ? (
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-4">This verification link has expired.</p>
                      <button
                        type="button"
                        onClick={() => router.push('/auth')}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700"
                      >
                        Go to Login to Resend
                      </button>
                    </div>
                  ) : (
                    <>
                      <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">New Password</label>
                        <Field type="password" name="password" className={`mt-1 block w-full px-4 py-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 sm:text-sm ${errors.password && touched.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-emerald-500'}`} />
                        <ErrorMessage name="password" component="p" className="text-red-500 text-xs mt-1" />
                      </div>

                      <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                        <Field type="password" name="confirmPassword" className={`mt-1 block w-full px-4 py-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 sm:text-sm ${errors.confirmPassword && touched.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-emerald-500'}`} />
                        <ErrorMessage name="confirmPassword" component="p" className="text-red-500 text-xs mt-1" />
                      </div>

                      <button type="submit" disabled={isSubmitting || !token || !!success} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:bg-emerald-400">
                        {isSubmitting ? 'Setting Password...' : 'Set Password & Verify'}
                      </button>
                    </>
                  )}
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    </div>
  );
}
