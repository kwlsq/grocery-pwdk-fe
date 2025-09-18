'use client';

import React, { useState } from 'react';
import { useStoreStore } from '@/store/storeStore'; // CORRECTED: Using path alias
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { StoreRequestData } from '@/types/store'; // Assumes types are in src/types
import { StoreLocationInput } from './StoreLocation'; // 1. Import your new component

// This schema validates the final data before submission
const addStoreSchema = Yup.object().shape({
    name: Yup.string().required('Store name is required'),
    address: Yup.string().required('A valid address must be selected'),
    latitude: Yup.number().required(),
    longitude: Yup.number().required(),
});

export const AddStoreDialog = () => {
    const { addStore } = useStoreStore();
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                 <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                    Add Store
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader><DialogTitle>Add New Store</DialogTitle></DialogHeader>
                <Formik
                    initialValues={{ name: '', description: '', address: '', latitude: 0, longitude: 0 }}
                    validationSchema={addStoreSchema}
                    onSubmit={async (values: StoreRequestData, { setSubmitting, setStatus, resetForm }) => {
                        try {
                            // The backend now trusts the coordinates from the frontend
                            await addStore(values);
                            setSubmitting(false);
                            resetForm();
                            setOpen(false);
                        } catch (error) {
                            setStatus('Failed to create store. Please try again.');
                            setSubmitting(false);
                        }
                    }}
                >
                    {({ isSubmitting, status, setFieldValue, values }) => (
                        <Form className="space-y-4 py-4">
                            {status && <p className="text-red-500 text-sm text-center">{status}</p>}
                            <div>
                                <Label htmlFor="name">Store Name</Label>
                                <Field as={Input} name="name" id="name" />
                                <ErrorMessage name="name" component="p" className="text-red-500 text-xs mt-1" />
                            </div>
                            <div>
                                <Label htmlFor="description">Description (Optional)</Label>
                                <Field as={Textarea} name="description" id="description" />
                            </div>

                            {/* 2. Use the new smart location component */}
                            {/* It handles the map, autocomplete, and geocoding internally */}
                            <StoreLocationInput 
                                onLocationSelect={(address, lat, lng) => {
                                    // When a location is selected, update the Formik state
                                    setFieldValue('address', address);
                                    setFieldValue('latitude', lat);
                                    setFieldValue('longitude', lng);
                                }}
                            />
                            <ErrorMessage name="address" component="p" className="text-red-500 text-xs mt-1" />

                            {/* Hidden fields to store lat/lng in the form's state for validation */}
                            <Field type="hidden" name="latitude" />
                            <Field type="hidden" name="longitude" />

                            <DialogFooter>
                                <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                                <Button type="submit" disabled={isSubmitting || !values.address}>
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

