'use client';

import React, { useState } from 'react';
import { useStoreStore } from '@/store/storeStore';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { StoreRequestData } from '@/types/store';
import { StoreLocationInput } from './StoreLocation'; // Fixed import

const addStoreSchema = Yup.object().shape({
    name: Yup.string()
        .min(2, 'Store name must be at least 2 characters')
        .max(100, 'Store name must not exceed 100 characters')
        .required('Store name is required'),
    description: Yup.string()
        .max(1000, 'Description must not exceed 1000 characters'),
    address: Yup.string().required('A valid address must be selected'),
    latitude: Yup.number()
        .min(-90, 'Invalid latitude')
        .max(90, 'Invalid latitude')
        .required('Location coordinates are required'),
    longitude: Yup.number()
        .min(-180, 'Invalid longitude')
        .max(180, 'Invalid longitude')
        .required('Location coordinates are required'),
});

export const AddStoreDialog = () => {
    const { addStore } = useStoreStore();
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Store
                </button>
            </DialogTrigger>
           <DialogContent 
    className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto"
    onInteractOutside={(e) => {
        // Type cast to Element to access querySelector
        if (e.currentTarget && e.currentTarget instanceof Element) {
            const isSubmitting = e.currentTarget.querySelector('[type="submit"][disabled]');
            if (isSubmitting) e.preventDefault();
        }
    }}
>
                <DialogHeader>
                    <DialogTitle>Add New Store</DialogTitle>
                </DialogHeader>
                <Formik
                    initialValues={{ 
                        name: '', 
                        description: '', 
                        address: '', 
                        latitude: 0, 
                        longitude: 0 
                    }}
                    validationSchema={addStoreSchema}
                    onSubmit={async (values: StoreRequestData, { setSubmitting, setStatus, resetForm }) => {
                        try {
                            setStatus('');
                            await addStore(values);
                            resetForm();
                            setOpen(false);
                            // You might want to add a toast notification here
                        } catch (error: any) {
                            const errorMessage = error?.response?.data?.message || 
                                                error?.message || 
                                                'Failed to create store. Please try again.';
                            setStatus(errorMessage);
                        } finally {
                            setSubmitting(false);
                        }
                    }}
                >
                    {({ isSubmitting, status, setFieldValue, values, setStatus }) => (
                        <Form className="space-y-4 py-4">
                            {status && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-red-600 text-sm">{status}</p>
                                </div>
                            )}
                            
                            <div>
                                <Label htmlFor="name">Store Name *</Label>
                                <Field 
                                    as={Input} 
                                    name="name" 
                                    id="name" 
                                    placeholder="Enter store name"
                                />
                                <ErrorMessage name="name" component="p" className="text-red-500 text-xs mt-1" />
                            </div>
                            
                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Field 
                                    as={Textarea} 
                                    name="description" 
                                    id="description" 
                                    placeholder="Store description (optional)"
                                    rows={3}
                                />
                                <ErrorMessage name="description" component="p" className="text-red-500 text-xs mt-1" />
                            </div>

                            <StoreLocationInput 
                                onLocationSelect={(address, lat, lng) => {
                                    setFieldValue('address', address);
                                    setFieldValue('latitude', lat);
                                    setFieldValue('longitude', lng);
                                    setStatus(''); // Clear errors when location is selected
                                }}
                            />
                            
                            {/* Location validation feedback */}
                            {values.address && values.latitude !== 0 && values.longitude !== 0 && (
                                <div className="text-green-600 text-sm flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Location confirmed: {values.address}
                                </div>
                            )}
                            
                            <ErrorMessage name="address" component="p" className="text-red-500 text-xs mt-1" />

                            {/* Hidden fields for coordinates */}
                            <Field type="hidden" name="latitude" />
                            <Field type="hidden" name="longitude" />

                            <DialogFooter className="gap-2">
                                <DialogClose asChild>
                                    <Button type="button" variant="secondary" disabled={isSubmitting}>
                                        Cancel
                                    </Button>
                                </DialogClose>
                                <Button 
                                    type="submit" 
                                    disabled={isSubmitting || !values.address || values.latitude === 0}
                                    className="min-w-[100px]"
                                >
                                    {isSubmitting ? "Saving..." : "Save Store"}
                                </Button>
                            </DialogFooter>
                        </Form>
                    )}
                </Formik>
            </DialogContent>
        </Dialog>
    );
};