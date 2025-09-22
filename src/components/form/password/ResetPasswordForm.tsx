'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { resetPassword } from '@/services/authService'; 
import { GrocereachLogo } from '@/components/GrocereachLogo';
import { PasswordField } from '@/components/ui/PasswordField';

interface ResetPasswordFormProps {
  token: string;
}

const resetPasswordSchema = Yup.object().shape({
  newPassword: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number')
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
                        
                        <PasswordField 
                            label="New Password"
                            name="newPassword"
                            error={errors.newPassword}
                            touched={touched.newPassword}
                        />

                        <PasswordField 
                            label="Confirm New Password"
                            name="confirmPassword"
                            error={errors.confirmPassword}
                            touched={touched.confirmPassword}
                        />

                        <button type="submit" disabled={isSubmitting || !!success} className="w-full flex justify-center py-3 px-4 border rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400">
                            {isSubmitting ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </Form>
                )}
            </Formik>
        </div>
    );
};