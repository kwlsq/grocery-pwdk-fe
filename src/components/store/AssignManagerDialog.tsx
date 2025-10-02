'use client';

import React, { useState, useEffect } from 'react';
import { Formik, Form, ErrorMessage, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { assignManager } from '@/services/storeService';
import { getManagerUsers } from '@/services/userService';
import { Store } from '@/types/store';
import { User } from '@/types/user';
import { AxiosError } from 'axios';

interface AssignManagerDialogProps {
    store: Store;
    allStores: Store[];
    onSuccess?: () => void;
}

interface AssignManagerValues {
  userId: string;
}

const assignManagerSchema = Yup.object().shape({
    userId: Yup.string().required('Please select a manager'),
});

export const AssignManagerDialog: React.FC<AssignManagerDialogProps> = ({
    store,
    allStores,
    onSuccess
}) => {
    const [open, setOpen] = useState(false);
    const [managers, setManagers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchAvailableManagers = async () => {
        try {
            setLoading(true);
            const response = await getManagerUsers();

            console.log('API Response:', response);

            // Handle your actual API response structure
            let managers = [];
            if (response?.data?.data?.content && Array.isArray(response.data.data.content)) {
                managers = response.data.data.content; // Notice the extra .data
            } else {
                console.warn('Unexpected API response structure:', response);
                setManagers([]);
                return;
            }

            console.log('All managers found:', managers);

            // Filter out managers assigned to OTHER stores
            const assignedManagerIds = allStores
                .filter(s => s.storeManager && s.id !== store.id)
                .map(s => s.storeManager!.id); // Use ! since we filtered out undefined values

            console.log('Assigned manager IDs:', assignedManagerIds);

            const availableManagers = managers.filter(manager =>
                !assignedManagerIds.includes(manager.id)
            );

            console.log('Available managers:', availableManagers);

            setManagers(availableManagers);
        } catch (error) {
            console.error('Failed to fetch managers:', error);
            setManagers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) {
            fetchAvailableManagers();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const handleAssignManager = async (values: AssignManagerValues, { setSubmitting, setStatus }: FormikHelpers<AssignManagerValues>) => {
        try {
            await assignManager(store.id, values.userId);
            setOpen(false);
            onSuccess?.();
        } catch (err) {
            const error = err as AxiosError<{ message?: string }>;

            let errorMessage = 'Failed to assign manager';

            if (error?.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error?.message) {
                errorMessage = error.message;
            }

            setStatus(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant={store.storeManager ? "outline" : "default"}
                    size="sm"
                    className="gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {store.storeManager ? 'Change Manager' : 'Assign Manager'}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>
                        {store.storeManager ? 'Change Store Manager' : 'Assign Store Manager'}
                    </DialogTitle>
                    <p className="text-sm text-gray-600">
                        Store: <span className="font-medium">{store.name}</span>
                    </p>
                    {store.storeManager && (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-sm text-yellow-800">
                                <strong>Current Manager:</strong> {store.storeManager.name}
                            </p>
                            <p className="text-xs text-yellow-600">{store.storeManager.email}</p>
                        </div>
                    )}
                </DialogHeader>

                <Formik<AssignManagerValues>
                    initialValues={{ userId: '' }}
                    validationSchema={assignManagerSchema}
                    onSubmit={handleAssignManager}
                >
                    {({ isSubmitting, status, setFieldValue, values }) => (
                        <Form className="space-y-4 py-4">
                            {status && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-red-600 text-sm">{status}</p>
                                </div>
                            )}

                            <div>
                                <Label htmlFor="userId">Select Manager</Label>
                                {loading ? (
                                    <div className="p-3 text-center text-gray-500">
                                        Loading available managers...
                                    </div>
                                ) : managers.length === 0 ? (
                                    <div className="p-3 text-center text-gray-500 bg-gray-50 rounded-lg border">
                                        No available managers found
                                    </div>
                                ) : (
                                    <Select
                                        value={values.userId}
                                        onValueChange={(value) => setFieldValue('userId', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choose a manager..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {managers.map((manager) => (
                                                <SelectItem key={manager.id} value={manager.id}>
                                                    <div className="flex flex-col items-start">
                                                        <span className="font-medium">{manager.fullName}</span>
                                                        <span className="text-xs text-gray-500">{manager.email}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                                <ErrorMessage name="userId" component="p" className="text-red-500 text-xs mt-1" />
                            </div>

                            <DialogFooter className="gap-2">
                                <DialogClose asChild>
                                    <Button type="button" variant="secondary" disabled={isSubmitting}>
                                        Cancel
                                    </Button>
                                </DialogClose>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting || !values.userId || loading}
                                >
                                    {isSubmitting ? "Assigning..." : "Assign Manager"}
                                </Button>
                            </DialogFooter>
                        </Form>
                    )}
                </Formik>
            </DialogContent>
        </Dialog>
    );
};