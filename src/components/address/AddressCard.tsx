'use client';

import React from 'react';
import { Address } from '@/types/address'; 

const EditIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg> );
const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg> );

interface AddressCardProps {
    address: Address;
    onEdit: () => void;
    onDelete: () => void;
}

export const AddressCard: React.FC<AddressCardProps> = ({ address, onEdit, onDelete }) => {
    return (
        <div className="border rounded-lg p-4 flex justify-between items-start">
            <div>
                <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{address.label}</h3>
                    {address.isPrimary && <span className="text-xs bg-emerald-100 text-emerald-800 font-medium px-2 py-0.5 rounded-full">Primary</span>}
                </div>
                <p className="text-gray-600">{address.recipientName} ({address.phone})</p>
                <p className="text-gray-600">{address.fullAddress}, {address.city}, {address.province}, {address.postalCode}</p>
            </div>
            <div className="flex space-x-2">
                <button onClick={onEdit} className="p-2 hover:bg-gray-100 rounded-full"><EditIcon className="h-5 w-5 text-gray-500"/></button>
                <button onClick={onDelete} className="p-2 hover:bg-gray-100 rounded-full"><TrashIcon className="h-5 w-5 text-red-500"/></button>
            </div>
        </div>
    );
};
