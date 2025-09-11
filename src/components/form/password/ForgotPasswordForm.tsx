'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { requestPasswordReset } from '@/services/authService';
import { GrocereachLogo } from '@/components/GrocereachLogo';

const forgotPasswordSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email address').required('Email is required'),
});

export const ForgotPasswordForm = () => {
    const [serverMessage, setServerMessage] = useState('');
    const router = useRouter();

    return (
        <div className="w-full">
            <GrocereachLogo />
            <div className="text-center mt-4">
                <h2 className="text-2xl font-bold text-gray-900">Forgot Password</h2>
                <p className="text-gray-500 mt-1">Enter your email to receive a reset link.</p>
            </div>
            <Formik
                initialValues={{ email: '' }}
                validationSchema={forgotPasswordSchema}
                onSubmit={async (values, { setSubmitting }) => {
                    setServerMessage('');
                    try {
                        const response = await requestPasswordReset(values);
                        setServerMessage(response.data);
                    } catch (err: any) {
                        setServerMessage('If an account with that email exists, a password reset link has been sent.');
                    } finally {
                        setSubmitting(false);
                    }
                }}
            >
                {({ isSubmitting, errors, touched }) => (
                    <Form className="mt-8 space-y-6">
                        {serverMessage && <p className="text-green-600 bg-green-100 p-3 rounded-md text-sm text-center">{serverMessage}</p>}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                            <Field 
                                type="email" 
                                name="email" 
                                className={`mt-1 block w-full px-4 py-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 sm:text-sm ${errors.email && touched.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-emerald-500'}`}
                            />
                            <ErrorMessage name="email" component="p" className="text-red-500 text-xs mt-1" />
                        </div>
                        <button 
                            type="submit" 
                            disabled={isSubmitting || !!serverMessage} 
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:bg-emerald-400"
                        >
                            {isSubmitting ? 'Sending Link...' : 'Send Reset Link'}
                        </button>
                    </Form>
                )}
            </Formik>
             <p className="mt-8 text-center text-sm text-gray-600">
                Remember your password?{' '}
                <button onClick={() => router.push('/auth')} className="font-medium text-emerald-600 hover:text-emerald-500">
                    Login
                </button>
            </p>
        </div>
    );
};

