// src/app/checkout/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { Address } from '@/types/address';
import { ShippingOption } from '@/types/shipping';
import { getCheckoutAddresses, calculateShippingOptions } from '@/services/shippingService';
import { AuthRequiredModal } from '@/components/auth/AuthRequiredModal';
import { VerificationRequiredModal } from '@/components/auth/VerificationRequiredModal';

// --- Reusable Icon Components ---
const TruckIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg> );
const MapPinIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg> );

export default function CheckoutPage() {
    // Checkout page: requires auth + CUSTOMER role + verification
    const { 
        isLoading: authLoading, 
        isAuthenticated, 
        showAuthModal, 
        showVerificationModal,
        handleGoToAuth, 
        handleGoHome,
        handleGoToVerification,
        accessDenied 
    } = useProtectedRoute({
        requireAuth: true,
        requireVerification: true, // Checkout requires verification
        allowedRoles: ['CUSTOMER']
    });
    
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
    const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
    const [isShippingLoading, setIsShippingLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isAuthenticated && !authLoading && !showVerificationModal) {
            const fetchAddresses = async () => {
                try {
                    console.log('Fetching addresses...'); 
                    const response = await getCheckoutAddresses();
                    console.log('Addresses response:', response); 
                    console.log('Addresses data:', response?.data); 
                    
                    const addressData = response?.data?.data || response?.data;
                    
                    if (addressData?.addresses && Array.isArray(addressData.addresses)) {
                        setAddresses(addressData.addresses);
                        if (addressData.primaryAddress) {
                            setSelectedAddress(addressData.primaryAddress);
                        } else if (addressData.addresses.length > 0) {
                            setSelectedAddress(addressData.addresses[0]);
                        }
                    } else {
                        console.warn('Invalid addresses data structure:', response?.data);
                        setAddresses([]);
                    }
                } catch (err) {
                    console.error('Address fetch error:', err);
                    setError('Failed to load your addresses. Please try again.');
                    setAddresses([]);
                }
            };
            fetchAddresses();
        }
    }, [isAuthenticated, authLoading, showVerificationModal]);

    // Calculate shipping costs whenever the selected address changes
    useEffect(() => {
        if (selectedAddress) {
            const calculateShipping = async () => {
                setIsShippingLoading(true);
                setShippingOptions([]);
                setError(null);
                try {
                    const requestData = {
                        storeId: '288705db-7fff-48d1-b4dd-e0a87136bdc6',
                        addressId: selectedAddress.id,
                        totalWeight: 1000
                    };
                    
                    const response = await calculateShippingOptions(requestData);                    
                    let shippingData = null;
                    if (response && response.data) {
                        if (Array.isArray(response.data)) {
                            shippingData = response.data;
                        } else if (response.data.data && Array.isArray(response.data.data)) {
                            shippingData = response.data.data;
                        } else if (response.data.shippingOptions && Array.isArray(response.data.shippingOptions)) {
                            shippingData = response.data.shippingOptions;
                        } else {
                            console.warn('API returned unexpected structure:', response.data);
                            shippingData = [];
                        }
                    } else {
                        console.warn('API returned no data');
                        shippingData = [];
                    }
                    
                    setShippingOptions(shippingData);
                } catch (err) {
                    setError('Failed to calculate shipping costs.');
                    setShippingOptions([]);
                } finally {
                    setIsShippingLoading(false);
                }
            };
            calculateShipping();
        } else {
            setShippingOptions([]);
        }
    }, [selectedAddress]);

    // Show loading while checking authentication
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

    // Don't render if access denied (will redirect automatically)
    if (accessDenied) {
        return null;
    }

    // Show verification modal if needed
    if (showVerificationModal) {
        return (
            <VerificationRequiredModal 
                isOpen={showVerificationModal}
                onResendVerification={handleGoToVerification}
                onGoHome={handleGoHome}
                featureName="checkout"
            />
        );
    }

    // Don't render if not authenticated
    if (!isAuthenticated) {
        return (
            <AuthRequiredModal 
                isOpen={showAuthModal}
                onGoToAuth={handleGoToAuth}
                onGoHome={handleGoHome}
                pageName="checkout"
            />
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
                
                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">{error}</div>}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Side: Shipping and Payment */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Shipping Address Section */}
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <h2 className="text-xl font-semibold flex items-center gap-2"><MapPinIcon className="h-6 w-6 text-emerald-600"/> Shipping Address</h2>
                            {(addresses && addresses.length > 0) ? (
                                <select 
                                    className="mt-4 block w-full p-2 border border-gray-300 rounded-md"
                                    value={selectedAddress?.id || ''}
                                    onChange={(e) => {
                                        const address = addresses.find(a => a.id === e.target.value);
                                        setSelectedAddress(address || null);
                                    }}
                                >
                                    {addresses.map(addr => (
                                        <option key={addr.id} value={addr.id}>
                                            {addr.label} - {addr.recipientName}, {addr.fullAddress}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <p className="mt-4 text-gray-600">You have no saved addresses. Please add one in your profile.</p>
                            )}
                        </div>

                       {/* Shipping Method Section */}
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                             <h2 className="text-xl font-semibold flex items-center gap-2"><TruckIcon className="h-6 w-6 text-emerald-600"/> Shipping Method</h2>
                            <div className="mt-4 space-y-4">
                                {isShippingLoading ? (
                                    <p>Calculating shipping options...</p>
                                ) : (() => {
                                    if (!shippingOptions) {
                                        return <p>No shipping options available (data is null).</p>;
                                    }
                                    
                                    if (!Array.isArray(shippingOptions)) {
                                        return <p>No shipping options available (data format error).</p>;
                                    }
                                    
                                    if (shippingOptions.length === 0) {
                                        return <p>No shipping options available for this address.</p>;
                                    }
                                    
                                    return shippingOptions.map((option, index) => {
                                        if (!option) {
                                            return null;
                                        }
                                        
                                        return (
                                            <div key={`${option.courier || 'unknown'}-${option.service || 'unknown'}-${index}`} className="border p-4 rounded-md flex justify-between items-center">
                                                <div>
                                                    <p className="font-semibold">{(option.courier || 'Unknown').toUpperCase()} - {option.service || 'Unknown Service'}</p>
                                                    <p className="text-sm text-gray-500">{option.description || 'No description'}</p>
                                                    <p className="text-sm text-gray-500">Est. {option.etd || 'N/A'} days</p>
                                                </div>
                                                <p className="font-semibold">Rp {(option.cost || 0).toLocaleString('id-ID')}</p>
                                            </div>
                                        );
                                    });
                                })()}
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-lg shadow-sm sticky top-28">
                            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                            <button className="w-full mt-6 bg-emerald-600 text-white py-3 px-4 rounded-lg hover:bg-emerald-700 transition-colors">
                                Place Order
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}