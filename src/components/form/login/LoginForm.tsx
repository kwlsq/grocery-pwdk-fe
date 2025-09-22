// src/components/form/login/LoginForm.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuthStore } from '../../../store/authStore'; 
import { loginUser } from '../../../services/authService'; 
import { GrocereachLogo } from '../../GrocereachLogo';
import { GoogleOAuthButton } from '@/components/ui/GoogleOauthButton';
import RedirectService from '@/services/redirectService';

const EyeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeOffIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
  </svg>
);

const loginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email address').required('Email is required'),
  password: Yup.string().required('Password is required'),
});

export const LoginForm = ({ setView }: { setView: (view: 'login' | 'register') => void }) => {
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { login } = useAuthStore();

  // Don't clear the redirect here! We want to keep it until after successful login

  return (
    <div className="w-full">
      <GrocereachLogo />
      <div className="text-center mt-4">
        <h2 className="text-2xl font-bold text-gray-900">Welcome to Grocereach</h2>
        <p className="text-gray-500 mt-1">Let's login into your account first</p>
      </div>

      <Formik
        initialValues={{ email: '', password: '' }}
        validationSchema={loginSchema}
        onSubmit={async (values, { setSubmitting }) => {
          setServerError('');
          try {
            console.log('Starting login process...');
            
            const response = await loginUser(values);
            console.log('Login successful, user data:', response.data.user);
            
            // Update auth state - this will trigger the redirect in AuthPage
            login(response.data.user);
            
            // Don't handle redirect here - let AuthPage handle it
            
          } catch (err: any) {
            console.error('Login failed:', err);
            if (err.response && err.response.data) {
                if (typeof err.response.data === 'string') {
                    setServerError(err.response.data);
                } else if (err.response.data.message) {
                    setServerError(err.response.data.message);
                } else {
                    setServerError('An unexpected error occurred.');
                }
            } else {
                setServerError('Login failed. Unable to connect to the server.');
            }
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting, errors, touched }) => (
          <Form className="mt-8 space-y-6">
            {serverError && <p className="text-red-500 bg-red-100 p-3 rounded-md text-sm text-center">{serverError}</p>}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
              <Field
                type="email"
                name="email"
                className={`mt-1 block w-full px-4 py-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 sm:text-sm ${errors.email && touched.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-emerald-500'}`}
              />
              <ErrorMessage name="email" component="p" className="text-red-500 text-xs mt-1" />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <div className="relative mt-1">
                <Field
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className={`block w-full px-4 py-3 pr-12 border rounded-md shadow-sm focus:outline-none focus:ring-2 sm:text-sm ${errors.password && touched.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-emerald-500'}`}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              <ErrorMessage name="password" component="p" className="text-red-500 text-xs mt-1" />
            </div>

            <div className="text-right">
              <a href="/forgot-password" className="text-sm font-medium text-emerald-600 hover:text-emerald-500">
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:bg-emerald-400"
            >
              {isSubmitting ? 'Logging In...' : 'Login'}
            </button>
          </Form>
        )}
      </Formik>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or Login With</span>
          </div>
        </div>

        <div className="mt-6">
          <GoogleOAuthButton />
        </div>
      </div>

      <p className="mt-8 text-center text-sm text-gray-600">
        Don't have an account?{' '}
        <button onClick={() => setView('register')} className="font-medium text-emerald-600 hover:text-emerald-500">
          Register
        </button>
      </p>
    </div>
  );
};