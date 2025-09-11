'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { resetPassword } from '@/services/authService'; // CORRECTED: Correct relative path
import { GrocereachLogo } from '@/components/GrocereachLogo';

interface ResetPasswordFormProps {
  token: string;
}

const resetPasswordSchema = Yup.object().shape({
  newPassword: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('New password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Passwords must match')
    .required('Please confirm your password'),
});

export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ token }) => {
    const router = useRouter();
    const [serverError, setServerError] = useState('');
    const [success, setSuccess] = useState('');

    return (
        <div className="w-full">
            <GrocereachLogo />
            <div className="text-center mt-4">
                <h2 className="text-2xl font-bold text-gray-900">Create a New Password</h2>
                <p className="text-gray-500 mt-1">Please enter your new password below.</p>
            </div>
            <Formik
                initialValues={{ newPassword: '', confirmPassword: '' }}
                validationSchema={resetPasswordSchema}
                onSubmit={async (values, { setSubmitting }) => {
                    setServerError('');
                    setSuccess('');
                    try {
                        const response = await resetPassword({ token, newPassword: values.newPassword });
                        setSuccess(response.data + " Redirecting to login...");
                        setTimeout(() => {
                            router.push('/auth');
                        }, 2000);
                    } catch (err: any) {
                        setServerError(err.response?.data || 'Password reset failed. The link may be invalid or expired.');
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
                            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">New Password</label>
                            <Field type="password" name="newPassword" className={`mt-1 block w-full px-4 py-3 border rounded-md shadow-sm ${errors.newPassword && touched.newPassword ? 'border-red-500' : 'border-gray-300'}`} />
                            <ErrorMessage name="newPassword" component="p" className="text-red-500 text-xs mt-1" />
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                            <Field type="password" name="confirmPassword" className={`mt-1 block w-full px-4 py-3 border rounded-md shadow-sm ${errors.confirmPassword && touched.confirmPassword ? 'border-red-500' : 'border-gray-300'}`} />
                            <ErrorMessage name="confirmPassword" component="p" className="text-red-500 text-xs mt-1" />
                        </div>
                        <button type="submit" disabled={isSubmitting || !!success} className="w-full flex justify-center py-3 px-4 border rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400">
                            {isSubmitting ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

