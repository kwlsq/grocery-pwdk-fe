'use client';

import React, { useState } from 'react';
import { useAuthStore } from '../../../store/authStore';
import { useUserVerification } from '../../../hooks/useUserVerification';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { updateUserProfile } from '../../../services/userService';
import { ChangeEmailDialog } from '@/components/profile/ChangeEmailDialog';
import { ChangePasswordForm } from './ChangePasswordForm';
import Image from 'next/image';
import { AxiosError } from 'axios';

const CameraIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
        <circle cx="12" cy="13" r="3" />
    </svg>
);

interface ProfileFormValues {
    fullName: string;
    profileImage?: File;
}

const profileSchema: Yup.Schema<ProfileFormValues> = Yup.object().shape({
    fullName: Yup.string().required('Full name is required'),
    profileImage: Yup.mixed<File>()
        .test('fileSize', 'The file is too large (max 1MB)', (value) => {
            if (!value) return true;
            return value.size <= 1024 * 1024;
        })
        .test('fileType', 'Unsupported format (JPG, PNG, GIF only)', (value) => {
            if (!value) return true;
            return ['image/jpeg', 'image/png', 'image/gif'].includes(value.type);
        }),
});

export const ProfileForm = () => {
    const { user, checkAuthStatus } = useAuthStore();
    const { isVerified } = useUserVerification();
    const [serverError, setServerError] = useState('');
    const [success, setSuccess] = useState('');
    const [imagePreview, setImagePreview] = useState<string | null>(user?.photoUrl || null);
    const [showChangePassword, setShowChangePassword] = useState(false);

    if (!user) {
        return <div>Loading profile...</div>;
    }

    const isDisabled = !isVerified;

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800">My Profile</h2>
            <p className="text-gray-500 mt-1">Manage your personal information.</p>

            {!isVerified && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center">
                        <svg className="w-5 h-5 text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <div>
                            <h3 className="text-sm font-medium text-yellow-800">Account Not Verified</h3>
                            <p className="text-sm text-yellow-700 mt-1">
                                Please verify your account to edit your profile information.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {showChangePassword ? (
                <div className="mt-8">
                    <button
                        onClick={() => setShowChangePassword(false)}
                        className="mb-4 text-blue-600 hover:text-blue-800 flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Profile
                    </button>
                    <ChangePasswordForm
                        onSuccess={() => setShowChangePassword(false)}
                        onCancel={() => setShowChangePassword(false)}
                    />
                </div>
            ) : (
                <Formik
                    initialValues={{
                        fullName: user.fullName || '',
                        email: user.email || '',
                        profileImage: undefined,
                    }}
                    validationSchema={profileSchema}
                    onSubmit={async (values, { setSubmitting }) => {
                        if (isDisabled) return;

                        setServerError('');
                        setSuccess('');

                        const formData = new FormData();

                        const profileData = { fullName: values.fullName };
                        formData.append('request', new Blob([JSON.stringify(profileData)], { type: 'application/json' }));

                        if (values.profileImage) {
                            formData.append('profileImage', values.profileImage);
                        }

                        try {
                            await updateUserProfile(formData);
                            await checkAuthStatus();
                            setSuccess('Profile updated successfully!');
                        } catch (err) {
                            const error = err as AxiosError<{ message?: string }>;

                            setServerError(error.response?.data?.message || 'Failed to update profile.');
                        } finally {
                            setSubmitting(false);
                        }
                    }}
                >
                    {({ isSubmitting, setFieldValue, errors, touched }) => (
                        <Form className="mt-8 space-y-6">
                            {serverError && <p className="text-red-500 bg-red-100 p-3 rounded-md text-sm">{serverError}</p>}
                            {success && <p className="text-green-600 bg-green-100 p-3 rounded-md text-sm">{success}</p>}

                            <div className="flex items-center space-x-4">
                                <div className="relative">
                                    <Image
                                        src={
                                            imagePreview ||
                                            `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=random`
                                        }
                                        alt="Profile"
                                        width={96}
                                        height={96}
                                        className={`h-24 w-24 rounded-full object-cover ${isDisabled ? "opacity-50" : ""}`}
                                    />
                                    <label
                                        htmlFor="profileImage"
                                        className={`absolute -bottom-1 -right-1 bg-white p-1.5 rounded-full shadow-md ${isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-gray-100'
                                            }`}
                                    >
                                        <CameraIcon className="h-5 w-5 text-gray-600" />
                                        <input
                                            id="profileImage"
                                            name="profileImage"
                                            type="file"
                                            className="hidden"
                                            disabled={isDisabled}
                                            onChange={(event) => {
                                                if (isDisabled) return;
                                                const file = event.currentTarget.files?.[0];
                                                if (file) {
                                                    setFieldValue('profileImage', file);
                                                    setImagePreview(URL.createObjectURL(file));
                                                }
                                            }}
                                        />
                                    </label>
                                </div>
                                <ErrorMessage name="profileImage" component="p" className="text-red-500 text-xs mt-1" />
                            </div>

                            <div>
                                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
                                <Field
                                    type="text"
                                    name="fullName"
                                    disabled={isDisabled}
                                    className={`mt-1 block w-full px-4 py-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 sm:text-sm ${errors.fullName && touched.fullName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-emerald-500'
                                        } ${isDisabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                                />
                                <ErrorMessage name="fullName" component="p" className="text-red-500 text-xs mt-1" />
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    Email Address
                                </label>
                                <div className="flex items-center gap-4">
                                    <Field
                                        type="email"
                                        name="email"
                                        disabled
                                        className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-500 cursor-not-allowed sm:text-sm"
                                    />
                                    {isVerified && <ChangeEmailDialog />}
                                </div>
                                <p className="text-xs text-gray-400 mt-1">
                                    {isVerified ? 'A verification link will be sent to your new email address.' : 'Verify your account to change email.'}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">Password</label>
                                <div className="flex items-center gap-4">
                                    <div className="flex-1 px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-500 text-sm">
                                        ••••••••••••
                                    </div>
                                    <button
                                        type="button"
                                        disabled={!isVerified}
                                        onClick={() => setShowChangePassword(true)}
                                        className={`flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium ${!isVerified
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500'
                                            } transition-colors`}
                                    >
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4l-2.3-2.3a1 1 0 0 0-1.4 0L15.5 5.5a1 1 0 0 0 0 1.4l.7.7-5.3 5.3" />
                                            <path d="m9 11 3 3L6 21l-3-3 6-7" />
                                        </svg>
                                        Change Password
                                    </button>
                                </div>
                                <p className="text-xs text-gray-400 mt-1">
                                    {isVerified ? 'Keep your account secure with a strong password.' : 'Verify your account to change password.'}
                                </p>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={isSubmitting || isDisabled}
                                    className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isDisabled
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:bg-emerald-400'
                                        }`}
                                >
                                    {isDisabled ? 'Verify Account to Save Changes' : (isSubmitting ? 'Saving...' : 'Save Changes')}
                                </button>
                            </div>
                        </Form>
                    )}
                </Formik>
            )}
        </div>
    );
};