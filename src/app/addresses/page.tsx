// src/app/addresses/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useProtectedRoute } from '../../hooks/useProtectedRoute';
import { Address } from '@/types/address';
import { getAddresses, deleteAddress } from '@/services/addressService';
import { ProfileSidebar } from '@/components/profile/ProfileSidebar';
import { AddressCard } from '@/components/address/AddressCard';
import { AddressModal } from '@/components/address/AddressModal';
import { AuthRequiredModal } from '@/components/auth/AuthRequiredModal';

const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => ( 
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M5 12h14"/><path d="M12 5v14"/>
    </svg> 
);

export default function UserAddressesPage() {
    // Addresses page: requires auth + CUSTOMER role, but NOT verification
    const { 
        isLoading: authLoading, 
        isAuthenticated, 
        isVerified,
        showAuthModal, 
        handleGoToAuth, 
        handleGoHome,
        accessDenied 
    } = useProtectedRoute({
        requireAuth: true,
        requireVerification: false, // Addresses can be viewed without verification
        allowedRoles: ['CUSTOMER']
    });
    
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [editingAddress, setEditingAddress] = useState<Partial<Address> | null>(null);
    const [isDataLoading, setIsDataLoading] = useState(true);

    const fetchAndSetAddresses = async () => {
        try {
            const response = await getAddresses();
            setAddresses(response.data);
        } catch (error) {
            console.error("Failed to fetch addresses", error);
        } finally {
            setIsDataLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated && !authLoading) {
            fetchAndSetAddresses();
        }
    }, [isAuthenticated, authLoading]);

    const handleSave = () => {
        if (!isVerified) return;
        fetchAndSetAddresses();
    };

    const handleDelete = async (addressId: string) => {
        if (!isVerified) return;
        if (window.confirm('Are you sure you want to delete this address?')) {
            try {
                await deleteAddress(addressId);
                setAddresses(prev => prev.filter(a => a.id !== addressId));
            } catch (error) {
                console.error("Failed to delete address", error);
            }
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }
    if (accessDenied) {
        return null;
    }

    if (!isAuthenticated) {
        return (
            <AuthRequiredModal 
                isOpen={showAuthModal}
                onGoToAuth={handleGoToAuth}
                onGoHome={handleGoHome}
                pageName="your addresses"
            />
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <a href="/" className="text-2xl font-bold text-emerald-600">Grocereach</a>
                    </div>
                </div>
            </header>
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <ProfileSidebar />
                    <div className="md:col-span-3">
                        <div className="bg-white p-8 rounded-2xl shadow-md">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-800">My Addresses</h2>
                                <button 
                                    onClick={() => isVerified && setEditingAddress({})} 
                                    disabled={!isVerified}
                                    className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg ${
                                        isVerified 
                                            ? 'text-white bg-emerald-600 hover:bg-emerald-700' 
                                            : 'text-gray-400 bg-gray-200 cursor-not-allowed'
                                    }`}
                                >
                                    <PlusIcon className="h-5 w-5" />
                                    <span>{isVerified ? 'Add New Address' : 'Verify Account to Add'}</span>
                                </button>
                            </div>

                            {!isVerified && (
                                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <div className="flex items-center">
                                        <svg className="w-5 h-5 text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                        </svg>
                                        <div>
                                            <h3 className="text-sm font-medium text-yellow-800">Account Not Verified</h3>
                                            <p className="text-sm text-yellow-700 mt-1">
                                                Please verify your account to add, edit, or delete addresses. You can view your existing addresses but cannot modify them.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {isDataLoading ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
                                    <p className="mt-2 text-gray-600">Loading addresses...</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {addresses.map(address => (
                                        <div key={address.id} className={!isVerified ? 'opacity-50 pointer-events-none' : ''}>
                                            <AddressCard 
                                                address={address} 
                                                onEdit={() => isVerified && setEditingAddress(address)}
                                                onDelete={() => isVerified && handleDelete(address.id)}
                                            />
                                        </div>
                                    ))}
                                    {addresses.length === 0 && (
                                        <p className="text-gray-500 text-center py-8">
                                            {isVerified ? 'You have no saved addresses.' : 'No addresses to display.'}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            {editingAddress && isVerified && (
                <AddressModal 
                    address={editingAddress} 
                    onClose={() => setEditingAddress(null)} 
                    onSave={handleSave} 
                />
            )}
        </div>
    );
}