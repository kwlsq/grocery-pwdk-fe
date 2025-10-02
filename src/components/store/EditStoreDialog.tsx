'use client';

import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage, FieldProps } from 'formik';
import * as Yup from 'yup';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '../ui/Switch';
import { StoreLocationInput } from './StoreLocation';
import { updateStore } from '@/services/storeService';
import { Store } from '@/types/store';
import { useStoreStore } from '@/store/storeStore';
import { AxiosError } from 'axios';

interface EditStoreDialogProps {
    store: Store;
    onSuccess?: () => void;
}

const editStoreSchema = Yup.object().shape({
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
    isActive: Yup.boolean().required(),
});

export const EditStoreDialog: React.FC<EditStoreDialogProps> = ({ store, onSuccess }) => {
    const [open, setOpen] = useState(false);
    const { stores } = useStoreStore();

    const currentStore = stores.find(s => s.id === store.id) || store;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Store
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Store</DialogTitle>
                    <p className="text-sm text-gray-600">
                        Update store information and location
                    </p>
                </DialogHeader>

                <Formik
                    key={currentStore.id}
                    initialValues={{
                        name: currentStore.name,
                        description: currentStore.description || '',
                        address: currentStore.address,
                        latitude: currentStore.latitude,
                        longitude: currentStore.longitude,
                        isActive: currentStore.active,
                    }}
                    validationSchema={editStoreSchema}
                    onSubmit={async (values, { setSubmitting, setStatus }) => {
                        try {
                            setStatus('');
                            await updateStore(currentStore.id, values);
                            setOpen(false);
                            onSuccess?.();
                        } catch (err) {
                            const error = err as AxiosError<{ message?: string }>;
                            const errorMessage = error?.response?.data?.message ||
                                error?.message ||
                                'Failed to update store. Please try again.';
                            setStatus(errorMessage);
                        } finally {
                            setSubmitting(false);
                        }
                    }}
                >
                    {({ isSubmitting, status, setFieldValue, setFieldTouched, values }) => (
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

                            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                                <div>
                                    <Label htmlFor="isActive" className="text-sm font-medium">
                                        Store Status
                                    </Label>
                                    <p className="text-xs text-gray-500">
                                        {values.isActive ? 'Store is currently active' : 'Store is currently inactive'}
                                    </p>
                                </div>
                                <Field name="isActive">
                                    {({ field }: FieldProps) => (
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={(checked) => {
                                                setFieldValue('isActive', checked);
                                                setFieldTouched('isActive', true);
                                            }}
                                        />
                                    )}
                                </Field>
                            </div>

                            <StoreLocationInput
                                onLocationSelect={(address, lat, lng) => {
                                    setFieldValue('address', address);
                                    setFieldValue('latitude', lat);
                                    setFieldValue('longitude', lng);
                                }}
                                defaultLocation={{ lat: currentStore.latitude, lng: currentStore.longitude }}
                            />

                            {values.address && values.latitude !== 0 && values.longitude !== 0 && (
                                <div className="text-green-600 text-sm flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Location confirmed: {values.address}
                                </div>
                            )}

                            <ErrorMessage name="address" component="p" className="text-red-500 text-xs mt-1" />

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
                                    {isSubmitting ? "Updating..." : "Update Store"}
                                </Button>
                            </DialogFooter>
                        </Form>
                    )}
                </Formik>
            </DialogContent>
        </Dialog>
    );
};