'use client';

import React, { useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { changeUserPassword } from '../../../services/userService';
import { PasswordField } from '@/components/ui/PasswordField';
import { AxiosError } from 'axios';

const changePasswordSchema = Yup.object().shape({
  currentPassword: Yup.string().required('Current password is required'),
  newPassword: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number')
    .required('New password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Passwords must match')
    .required('Please confirm your new password'),
});

interface ChangePasswordFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({ onSuccess, onCancel }) => {
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Change Password</h2>
        <p className="text-gray-500 mt-1">Enter your current password and choose a new one.</p>
      </div>

      <Formik
        initialValues={{
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        }}
        validationSchema={changePasswordSchema}
        onSubmit={async (values, { setSubmitting, resetForm }) => {
          setServerError('');
          setSuccess('');
          try {
            await changeUserPassword(values.currentPassword, values.newPassword);
            setSuccess('Password changed successfully!');
            resetForm();
            if (onSuccess) {
              setTimeout(onSuccess, 1500);
            }
          } catch (err) {
            const error = err as AxiosError<{ message?: string }>;

            setServerError(error.response?.data?.message || error.message || 'Failed to change password');
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting, errors, touched }) => (
          <Form className="space-y-6">
            {serverError && (
              <div className="text-red-600 bg-red-50 p-3 rounded-md text-sm border border-red-200">
                {serverError}
              </div>
            )}

            {success && (
              <div className="text-green-600 bg-green-50 p-3 rounded-md text-sm border border-green-200">
                {success}
              </div>
            )}

            <PasswordField
              label="Current Password"
              name="currentPassword"
              error={errors.currentPassword}
              touched={touched.currentPassword}
            />

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

            <div className="flex gap-3 pt-2">
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex-1 py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={isSubmitting || !!success}
                className="flex-1 flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400"
              >
                {isSubmitting ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};
