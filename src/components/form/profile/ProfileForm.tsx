'use client';

import React, { useState } from 'react';
import { useAuthStore } from '../../../store/authStore';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { updateUserProfile } from '../../../services/userService';

const CameraIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg> );

const profileSchema = Yup.object().shape({
  fullName: Yup.string().required('Full name is required'),
  profileImage: Yup
    .mixed()
    .test('fileSize', 'The file is too large (max 1MB)', (value: any) => {
      if (!value) return true; 
      return value.size <= 1024 * 1024; 
    })
    .test('fileType', 'Unsupported format (JPG, PNG, GIF only)', (value: any) => {
      if (!value) return true;
      return ['image/jpeg', 'image/png', 'image/gif'].includes(value.type);
    }),
});

export const ProfileForm = () => {
    const { user, checkAuthStatus } = useAuthStore();
    const [serverError, setServerError] = useState('');
    const [success, setSuccess] = useState('');
    const [imagePreview, setImagePreview] = useState<string | null>(user?.photoUrl || null);

    if (!user) {
        return <div>Loading profile...</div>;
    }

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800">My Profile</h2>
            <p className="text-gray-500 mt-1">Manage your personal information.</p>

            <Formik
                initialValues={{
                    fullName: user.fullName || '',
                    email: user.email || '',
                    profileImage: undefined,
                }}
                validationSchema={profileSchema}
                onSubmit={async (values, { setSubmitting }) => {
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
                        await checkAuthStatus(); // Re-fetch user data to update state
                        setSuccess('Profile updated successfully!');
                    } catch (err: any) {
                        setServerError(err.response?.data?.message || 'Failed to update profile.');
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
                                <img 
                                    src={imagePreview || `https://ui-avatars.com/api/?name=${user.fullName}&background=random`} 
                                    alt="Profile" 
                                    className="h-24 w-24 rounded-full object-cover"
                                />
                                <label htmlFor="profileImage" className="absolute -bottom-1 -right-1 bg-white p-1.5 rounded-full shadow-md cursor-pointer hover:bg-gray-100">
                                    <CameraIcon className="h-5 w-5 text-gray-600" />
                                    <input 
                                        id="profileImage"
                                        name="profileImage"
                                        type="file"
                                        className="hidden"
                                        onChange={(event) => {
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
                            <Field type="text" name="fullName" className={`mt-1 block w-full px-4 py-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 sm:text-sm ${errors.fullName && touched.fullName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-emerald-500'}`} />
                            <ErrorMessage name="fullName" component="p" className="text-red-500 text-xs mt-1" />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                            <Field type="email" name="email" disabled className="mt-1 block w-full px-4 py-3 border rounded-md shadow-sm bg-gray-100 text-gray-500 cursor-not-allowed" />
                            <p className="text-xs text-gray-400 mt-1">Email address cannot be changed.</p>
                        </div>

                        <div className="pt-2">
                             <button type="submit" disabled={isSubmitting} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:bg-emerald-400">
                                {isSubmitting ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );
};
