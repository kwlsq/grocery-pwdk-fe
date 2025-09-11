"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Address } from '@/types/address';
import { getAddresses, deleteAddress } from '@/services/addressService';
import { ProfileSidebar } from '@/components/profile/ProfileSidebar';
import { AddressCard } from '@/components/address/AddressCard';
import { AddressModal } from '@/components/address/AddressModal';

const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M5 12h14"/><path d="M12 5v14"/></svg> );

export default function UserAddressesPage() {
    const { isAuthenticated, checkAuthStatus } = useAuthStore();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [editingAddress, setEditingAddress] = useState<Partial<Address> | null>(null);

    const fetchAndSetAddresses = async () => {
        try {
            const response = await getAddresses();
            setAddresses(response.data);
        } catch (error) {
            console.error("Failed to fetch addresses", error);
        }
    };

    useEffect(() => {
        const loadInitialData = async () => {
            await checkAuthStatus();
            setIsLoading(false);
        };
        loadInitialData();
    }, [checkAuthStatus]);
    
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/auth');
        } else if (isAuthenticated) {
            fetchAndSetAddresses();
        }
    }, [isLoading, isAuthenticated, router]);

    const handleSave = (savedAddress: Address) => {
        fetchAndSetAddresses();
    };

    const handleDelete = async (addressId: string) => {
        if (window.confirm('Are you sure you want to delete this address?')) {
            try {
                await deleteAddress(addressId);
                setAddresses(prev => prev.filter(a => a.id !== addressId));
            } catch (error) {
                console.error("Failed to delete address", error);
            }
        }
    };

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (!isAuthenticated) {
        return null; 
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm"><div className="container mx-auto px-4 sm:px-6 lg:px-8"><div className="flex items-center justify-between h-16"><a href="/" className="text-2xl font-bold text-emerald-600">Grocereach</a></div></div></header>
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <ProfileSidebar />
                    <div className="md:col-span-3">
                        <div className="bg-white p-8 rounded-2xl shadow-md">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-800">My Addresses</h2>
                                <button onClick={() => setEditingAddress({})} className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700">
                                    <PlusIcon className="h-5 w-5" />
                                    <span>Add New Address</span>
                                </button>
                            </div>
                            <div className="space-y-4">
                                {addresses.map(address => (
                                    <AddressCard 
                                        key={address.id} 
                                        address={address} 
                                        onEdit={() => setEditingAddress(address)}
                                        onDelete={() => handleDelete(address.id)}
                                    />
                                ))}
                                {addresses.length === 0 && <p>You have no saved addresses.</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            {editingAddress && (<AddressModal address={editingAddress} onClose={() => setEditingAddress(null)} onSave={handleSave} />)}
        </div>
    );
}
