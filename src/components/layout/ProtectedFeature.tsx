'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserVerification } from '@/hooks/useUserVerification';

interface ProtectedFeatureProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireVerification?: boolean;
  fallback?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const ProtectedFeature: React.FC<ProtectedFeatureProps> = ({
  children,
  requireAuth = true,
  requireVerification = false,
  fallback,
  onClick,
  className = ''
}) => {
  const router = useRouter();
  const { canAccessFeature, getDisabledReason } = useUserVerification();
  const [showTooltip, setShowTooltip] = useState(false);

  const hasAccess = canAccessFeature(requireAuth, requireVerification);
  const reason = getDisabledReason(requireAuth, requireVerification);

  const handleClick = () => {
    if (!hasAccess && requireAuth) {
      router.push('/auth');
      return;
    }
    if (onClick) onClick();
  };

  if (!hasAccess && fallback) {
    return <>{fallback}</>;
  }

  return (
    <div 
      className={`relative ${className}`}
      onMouseEnter={() => !hasAccess && setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div
        className={!hasAccess ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        onClick={hasAccess ? onClick : handleClick}
        style={!hasAccess ? { pointerEvents: 'none' } : {}}
      >
        {children}
      </div>
      
      {!hasAccess && showTooltip && reason && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50">
          <div className="bg-gray-900 text-white text-xs rounded py-2 px-3 whitespace-nowrap">
            {reason}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      )}
    </div>
  );
};