'use client';

import React, { useState } from 'react';
import { Field, ErrorMessage } from 'formik';

// --- Reusable Icon Components ---
const EyeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const EyeOffIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
    <line x1="2" y1="2" x2="22" y2="22"/>
  </svg>
);

interface PasswordFieldProps {
    label: string;
    name: string;
    touched?: boolean;
    error?: string;
}

export const PasswordField: React.FC<PasswordFieldProps> = ({ label, name, touched, error }) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div>
            <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
            <div className="relative mt-1">
                <Field
                    type={showPassword ? 'text' : 'password'}
                    name={name}
                    id={name}
                    className={`block w-full px-4 py-3 border rounded-md shadow-sm ${error && touched ? 'border-red-500' : 'border-gray-300'}`}
                />
                <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                >
                    {showPassword ? (
                        <EyeOffIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                </button>
            </div>
            <ErrorMessage name={name} component="p" className="text-red-500 text-xs mt-1" />
        </div>
    );
};