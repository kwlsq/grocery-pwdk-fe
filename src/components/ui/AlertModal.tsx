'use client';

import React from 'react';

const AlertTriangleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
    </svg>
);

interface AlertModalProps {
    isOpen: boolean;
    onConfirm: () => void;
    title: string;
    message: string;
}

export const AlertModal: React.FC<AlertModalProps> = ({ isOpen, onConfirm, title, message }) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
                    <AlertTriangleIcon className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="mt-3">
                    <h3 className="text-lg font-semibold leading-6 text-gray-900">{title}</h3>
                    <div className="mt-2">
                        <p className="text-sm text-gray-500">{message}</p>
                    </div>
                </div>
                <div className="mt-5">
                    <button
                        type="button"
                        className="inline-flex w-full justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
                        onClick={onConfirm}
                    >
                        OK, Got It
                    </button>
                </div>
            </div>
        </div>
    );
};
