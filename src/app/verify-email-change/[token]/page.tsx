'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { confirmEmailChange } from '../../../services/authService'; 
import Link from 'next/link';
import { AxiosError } from 'axios';

export default function ConfirmEmailChangePage() {
    const params = useParams();
    const router = useRouter();
    const token = params.token as string;

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Verifying your new email address...');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('No verification token found. The link may be broken.');
            return;
        }

        const verifyToken = async () => {
            try {
                const response = await confirmEmailChange(token);
                setStatus('success');
                setMessage(response.data + ' You will be redirected to the login page shortly.');
                
                setTimeout(() => {
                    router.push('/auth'); 
                }, 3000);

            } catch (err) {
                  const error = err as AxiosError<{ message?: string }>;
                setStatus('error');
                setMessage(error.response?.data?.message || 'An error occurred. The token may be invalid or expired.');
            }
        };

        verifyToken();
    }, [token, router]);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
                {status === 'loading' && <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>}
                <h2 className="text-2xl font-bold mt-4">
                    {status === 'success' && 'Email Successfully Updated!'}
                    {status === 'error' && 'Verification Failed'}
                </h2>
                <p className={`mt-2 ${status === 'error' ? 'text-red-500' : 'text-gray-600'}`}>
                    {message}
                </p>
                {status !== 'loading' && (
                    <Link href="/auth" className="mt-6 inline-block px-6 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg">
                        Go to Login
                    </Link>
                )}
            </div>
        </div>
    );
}

