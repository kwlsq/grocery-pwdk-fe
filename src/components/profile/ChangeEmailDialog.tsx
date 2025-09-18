'use client';

import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { requestEmailChange } from '@/services/userService';

const changeEmailSchema = Yup.object().shape({
    newEmail: Yup.string().email('Invalid email address').required('New email is required'),
    currentPassword: Yup.string().required('Your current password is required to make this change'),
});

export const ChangeEmailDialog = () => {
    const [open, setOpen] = useState(false);
    const [serverMessage, setServerMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">Change Email</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Change Your Email Address</DialogTitle>
                </DialogHeader>
                <Formik
                    initialValues={{ newEmail: '', currentPassword: '' }}
                    validationSchema={changeEmailSchema}
                    onSubmit={async (values, { setSubmitting, setStatus }) => {
                        setServerMessage('');
                        setIsSuccess(false);
                        try {
                            const response = await requestEmailChange(values);
                            setServerMessage(response.data);
                            setIsSuccess(true);
                            setSubmitting(false);
                        } catch (error: any) {
                            setServerMessage(error.response?.data || 'An unexpected error occurred.');
                            setIsSuccess(false);
                            setSubmitting(false);
                        }
                    }}
                >
                    {({ isSubmitting }) => (
                        <Form className="space-y-4 py-4">
                            {serverMessage && (
                                <p className={`p-3 rounded-md text-sm text-center ${isSuccess ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-500'}`}>
                                    {serverMessage}
                                </p>
                            )}

                            {!isSuccess && (
                                <>
                                    <div>
                                        <Label htmlFor="newEmail">New Email Address</Label>
                                        <Field as={Input} type="email" name="newEmail" id="newEmail" />
                                        <ErrorMessage name="newEmail" component="p" className="text-red-500 text-xs mt-1" />
                                    </div>
                                    <div>
                                        <Label htmlFor="currentPassword">Current Password</Label>
                                        <Field as={Input} type="password" name="currentPassword" id="currentPassword" />
                                        <ErrorMessage name="currentPassword" component="p" className="text-red-500 text-xs mt-1" />
                                    </div>
                                </>
                            )}
                            
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button type="button" variant="secondary">Close</Button>
                                </DialogClose>
                                {!isSuccess && (
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? "Sending..." : "Send Verification Link"}
                                    </Button>
                                )}
                            </DialogFooter>
                        </Form>
                    )}
                </Formik>
            </DialogContent>
        </Dialog>
    );
};
