// This component should be placed at src/app/auth/page.tsx
// It assumes your Zustand store is at src/store/authStore.ts

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuthStore } from '@/store/authStore'; // Adjust path if needed
import axios from 'axios';

// --- Axios API Client (ensure it's configured for cookies) ---
const apiClient = axios.create({
  baseURL: 'http://localhost:8080',
  withCredentials: true,
});

// --- Yup Validation Schemas ---
const loginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email address').required('Email is required'),
  password: Yup.string().required('Password is required'),
});

const registerSchema = Yup.object().shape({
  fullName: Yup.string().required('Full name is required'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
});

// --- SVG Logo Component (matching your design) ---
const GrocereachLogo = () => (
    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500">
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" />
            <path d="M12 5v14" />
        </svg>
    </div>
);


// --- Login Form Component ---
const LoginForm = ({ setView }: { setView: (view: 'login' | 'register') => void }) => {
  const [serverError, setServerError] = useState('');
  const router = useRouter();
  const { checkAuthStatus } = useAuthStore();

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
            await apiClient.post('/api/auth/login', values);
            await checkAuthStatus();
            router.push('/');
          } catch (err: any) {
            // --- THIS IS THE FIX ---
            // This error handler is now more robust. It checks if the backend
            // sent a simple string or a complex object, and extracts the
            // correct message in either case.
            if (err.response && err.response.data) {
                if (typeof err.response.data === 'string') {
                    // Handles simple string errors like "Invalid email or password."
                    setServerError(err.response.data);
                } else if (err.response.data.message) {
                    // Handles complex Spring Boot error objects
                    setServerError(err.response.data.message);
                } else {
                    // Fallback for other unexpected object structures
                    setServerError('An unexpected error occurred.');
                }
            } else {
                // Fallback for network errors or other issues
                setServerError('Login failed. Unable to connect to the server.');
            }
            // -------------------------
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
              <Field
                type="password"
                name="password"
                className={`mt-1 block w-full px-4 py-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 sm:text-sm ${errors.password && touched.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-emerald-500'}`}
              />
              <ErrorMessage name="password" component="p" className="text-red-500 text-xs mt-1" />
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
          <a
            href="http://localhost:8080/oauth2/authorization/google"
            className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
             <svg className="w-5 h-5 mr-2" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                <path d="M1 1h22v22H1z" fill="none"/>
            </svg>
            <span>Google</span>
          </a>
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


// --- Register Form Component ---
const RegisterForm = ({ setView }: { setView: (view: 'login' | 'register') => void }) => {
    const [serverError, setServerError] = useState('');
    const [success, setSuccess] = useState('');

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
                const response = await apiClient.post('/api/auth/register', values);
                setSuccess(response.data);
                resetForm();
              } catch (err: any) {
                if (err.response && err.response.data && typeof err.response.data === 'string') {
                    setServerError(err.response.data);
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
                {serverError && <p className="text-red-500 bg-red-100 p-3 rounded-md text-sm text-center">{serverError}</p>}
                {success && <p className="text-green-600 bg-green-100 p-3 rounded-md text-sm text-center">{success}</p>}
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
                  <Field type="text" name="fullName" className={`mt-1 block w-full px-4 py-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 sm:text-sm ${errors.fullName && touched.fullName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-emerald-500'}`} />
                  <ErrorMessage name="fullName" component="p" className="text-red-500 text-xs mt-1" />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                  <Field type="email" name="email" className={`mt-1 block w-full px-4 py-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 sm:text-sm ${errors.email && touched.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-emerald-500'}`} />
                  <ErrorMessage name="email" component="p" className="text-red-500 text-xs mt-1" />
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:bg-emerald-400">
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


// --- Main Page Component ---
export default function AuthPage() {
  const [view, setView] = useState<'login' | 'register'>('login');
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10">
          {view === 'login' ? <LoginForm setView={setView} /> : <RegisterForm setView={setView} />}
        </div>
      </div>
    </div>
  );
}
