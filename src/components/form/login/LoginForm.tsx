'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuthStore } from '../../../store/authStore'; 
import { loginUser } from '../../../services/authService'; 
import { GrocereachLogo } from '../../GrocereachLogo';
import { GoogleOAuthButton } from '@/components/ui/GoogleOauthButton';
import { PasswordField } from '@/components/ui/PasswordField';

const loginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email address').required('Email is required'),
  password: Yup.string().required('Password is required'),
});

export const LoginForm = ({ setView }: { setView: (view: 'login' | 'register') => void }) => {
  const [serverError, setServerError] = useState('');
  const router = useRouter();
  const { login } = useAuthStore();

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
            const response = await loginUser(values);
            login(response.data.user);
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

            <PasswordField 
                label="Password"
                name="password"
                error={errors.password}
                touched={touched.password}
            />

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

