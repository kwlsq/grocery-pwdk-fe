'use client';

import React from 'react';
import { useUserVerification } from '@/hooks/useUserVerification';
import { UnauthorizedPopup } from '../notification/UnauthorizedPopup';

interface VerificationWrapperProps {
  children: React.ReactNode;
  protectedPaths?: string[];
  redirectTo?: string;
}

export const VerificationWrapper: React.FC<VerificationWrapperProps> = ({
  children,
  protectedPaths,
  redirectTo = '/'
}) => {
  const { popup, handlePopupConfirm } = useUserVerification({
    protectedPaths,
    redirectTo,
    usePopup: true
  });

  return (
    <>
      {children}
      <UnauthorizedPopup
        show={popup.show}
        message={popup.message}
        onConfirm={handlePopupConfirm}
      />
    </>
  );
};