'use client';

import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
// --- Import the new service function ---
import { registerUser } from '../../../services/authService'; // Corrected path
import { GrocereachLogo } from '../../GrocereachLogo';

// --- Yup Validation Schema ---
const registerSchema = Yup.object().shape({
  fullName: Yup.string().required('Full name is required'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
});

export const RegisterForm = ({ setView }: { setView: (view: 'login' | 'register') => void }) => {
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
                // --- USE THE SERVICE FUNCTION ---
                const response = await registerUser(values);
                // -----------------------------
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

