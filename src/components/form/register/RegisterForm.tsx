'use client';

import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../../store/authStore';
import { registerUser } from '../../../services/authService';
import { GrocereachLogo } from '../../GrocereachLogo';
import RedirectService from '@/services/redirectService';

const registerSchema = Yup.object().shape({
  fullName: Yup.string().required('Full name is required'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
});

export const RegisterForm = ({ setView }: { setView: (view: 'login' | 'register') => void }) => {
    const [serverError, setServerError] = useState('');
    const [success, setSuccess] = useState('');
    const router = useRouter();
    const { checkAuthStatus } = useAuthStore();

    return (
        <div className="w-full">
          <GrocereachLogo />
          <div className="text-center mt-4">
            <h2 className="text-2xl font-bold text-gray-900">Create your Account</h2>
            <p className="text-gray-500 mt-1">Get started with Grocereach</p>
          </div>
          <Formik
            initialValues={{ fullName: '', email: '' }}
            validationSchema={registerSchema}
            onSubmit={async (values, { setSubmitting, resetForm }) => {
              setServerError('');
              setSuccess('');
              try {
                await registerUser(values);
                
                setSuccess('Account created successfully! Redirecting...');
                
                await checkAuthStatus();
                
                const redirectTo = RedirectService.handlePostLoginRedirect();
                
                setTimeout(() => {
                  router.push(redirectTo);
                }, 1500);
                
                resetForm();
              } catch (err: any) {
                if (err.response && err.response.data && typeof err.response.data === 'string') {
                    setServerError(err.response.data);
                } else if (err.response && err.response.data && err.response.data.message) {
                    setServerError(err.response.data.message);
                } else {
                    setServerError('An unknown registration error occurred.');
                }
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {({ isSubmitting, errors, touched }) => (
              <Form className="mt-8 space-y-6">
                {serverError && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-red-600 text-sm text-center">{serverError}</p>
                  </div>
                )}
                {success && (
                  <div className="bg-green-50 border border-green-200 rounded-md p-3">
                    <p className="text-green-600 text-sm text-center">{success}</p>
                  </div>
                )}
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
                  <Field 
                    type="text" 
                    name="fullName" 
                    className={`mt-1 block w-full px-4 py-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 sm:text-sm ${
                      errors.fullName && touched.fullName 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-emerald-500'
                    }`} 
                  />
                  <ErrorMessage name="fullName" component="p" className="text-red-500 text-xs mt-1" />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                  <Field 
                    type="email" 
                    name="email" 
                    className={`mt-1 block w-full px-4 py-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 sm:text-sm ${
                      errors.email && touched.email 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-emerald-500'
                    }`} 
                  />
                  <ErrorMessage name="email" component="p" className="text-red-500 text-xs mt-1" />
                </div>
                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:bg-emerald-400 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Creating Account...' : 'Register'}
                </button>
              </Form>
            )}
          </Formik>
          <p className="mt-8 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <button onClick={() => setView('login')} className="font-medium text-emerald-600 hover:text-emerald-500">
              Login
            </button>
          </p>
        </div>
    );
};