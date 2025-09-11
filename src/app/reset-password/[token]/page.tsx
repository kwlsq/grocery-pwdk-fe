'use client';

import React, { Suspense } from 'react';
import { useParams } from 'next/navigation';
import { ResetPasswordForm } from '@/components/form/password/ResetPasswordForm';

export default function ResetPasswordPage() {
  const params = useParams();
  const token = params.token as string;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10">
          <Suspense fallback={<div>Loading...</div>}>
            {/* The token from the URL is now passed as a prop */}
            <ResetPasswordForm token={token} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

