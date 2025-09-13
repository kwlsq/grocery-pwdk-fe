'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Formik, Form, Field, ErrorMessage, FormikProps } from 'formik';
import * as Yup from 'yup';
import { Address, Province, City, AddressFormValues } from '@/types/address'; 
import { getProvinces, getCitiesByProvinceId } from '@/services/locationService';
import { createAddress, updateAddress } from '@/services/addressService';

const addressSchema = Yup.object().shape({
  label: Yup.string().required('Label is required'),
  recipientName: Yup.string().required("Recipient's name is required"),
  phone: Yup.string().required('Phone number is required'),
  fullAddress: Yup.string().required('Full address is required'),
  provinceId: Yup.string().required('Province is required'),
  cityId: Yup.string().required('City is required'),
  postalCode: Yup.string().required('Postal code is required'),
});

interface AddressModalProps {
    address: Partial<Address> | null;
    onClose: () => void;
    onSave: (savedAddress: Address) => void;
}

export const AddressModal: React.FC<AddressModalProps> = ({ address, onClose, onSave }) => {
    if (!address) return null;

    const [provinces, setProvinces] = useState<Province[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [selectedProvinceId, setSelectedProvinceId] = useState<string>('');
    const [isCitiesLoading, setIsCitiesLoading] = useState(false);
    const formikRef = useRef<FormikProps<AddressFormValues>>(null);

    const isEditing = !!address.id;

    const initialValues: AddressFormValues = {
        label: address.label || '',
        recipientName: address.recipientName || '',
        phone: address.phone || '',
        fullAddress: address.fullAddress || '',
        provinceId: 0,
        cityId: 0,
        postalCode: address.postalCode || '',
        primary: address.primary || false,
    };

    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                const response = await getProvinces();
                setProvinces(response.data);
            } catch (error) {
                console.error("Failed to fetch provinces", error);
            }
        };
        fetchProvinces();
    }, []);

    useEffect(() => {
        if (isEditing && address.province && provinces.length > 0) {
            const province = provinces.find(p => p.name === address.province);
            if (province) {
                const provinceIdStr = String(province.id);
                formikRef.current?.setFieldValue('provinceId', provinceIdStr);
                setSelectedProvinceId(provinceIdStr);
            }
        }
    }, [provinces, isEditing, address.province]);

    useEffect(() => {
        if (selectedProvinceId) {
            const fetchCities = async () => {
                setIsCitiesLoading(true);
                setCities([]);
                try {
                    const response = await getCitiesByProvinceId(selectedProvinceId);
                    setCities(response.data);
                } catch (error) {
                    console.error("Failed to fetch cities", error);
                } finally {
                    setIsCitiesLoading(false);
                }
            };
            fetchCities();
        } else {
            setCities([]);
        }
    }, [selectedProvinceId]);
    
    useEffect(() => {
        if (isEditing && address.city && cities.length > 0) {
            const city = cities.find(c => c.name === address.city);
            if (city) {
                formikRef.current?.setFieldValue('cityId', String(city.id));
            }
        }
    }, [cities, isEditing, address.city]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-4">{isEditing ? 'Edit Address' : 'Add New Address'}</h2>
                <Formik
                    innerRef={formikRef}
                    initialValues={initialValues}
                    validationSchema={addressSchema}
                    enableReinitialize
                    onSubmit={async (values, { setSubmitting, setStatus }) => {
                        setStatus(null);
                        
                        try {
                           const payload = {
                                label: values.label,
                                recipientName: values.recipientName,
                                phone: values.phone,
                                fullAddress: values.fullAddress,
                                provinceId: Number(values.provinceId),
                                cityId: Number(values.cityId),
                                postalCode: values.postalCode,
                                primary: values.primary,
                            };
                            console.log(payload)
                            const response = isEditing
                                ? await updateAddress(address.id!, payload)
                                : await createAddress(payload);
                            
                            onSave(response.data);
                            onClose();
                        } catch (err) {
                            setStatus('Failed to save address. Please try again.');
                        } finally {
                            setSubmitting(false);
                        }
                    }}
                >
                    {({ isSubmitting, status, setFieldValue }) => (
                        <Form className="space-y-4">
                            {status && <p className="text-red-500 text-sm">{status}</p>}
                            <Field name="label" placeholder="Label (e.g., Home, Office)" className="w-full p-2 border rounded" />
                            <ErrorMessage name="label" component="p" className="text-red-500 text-xs" />
                            <Field name="recipientName" placeholder="Recipient's Name" className="w-full p-2 border rounded" />
                            <ErrorMessage name="recipientName" component="p" className="text-red-500 text-xs" />
                            <Field name="phone" placeholder="Phone Number" className="w-full p-2 border rounded" />
                            <ErrorMessage name="phone" component="p" className="text-red-500 text-xs" />
                            <Field as="select" name="provinceId" className="w-full p-2 border rounded" onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                setFieldValue('provinceId', e.target.value);
                                setSelectedProvinceId(e.target.value);
                                setFieldValue('cityId', '');
                            }}>
                                <option value="">Select Province</option>
                                {provinces.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </Field>
                            <ErrorMessage name="provinceId" component="p" className="text-red-500 text-xs" />
                            <Field as="select" name="cityId" className="w-full p-2 border rounded" disabled={isCitiesLoading || !selectedProvinceId}>
                                <option value="">{isCitiesLoading ? 'Loading cities...' : 'Select City'}</option>
                                {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </Field>
                            <ErrorMessage name="cityId" component="p" className="text-red-500 text-xs" />
                            <Field name="postalCode" placeholder="Postal Code" className="w-full p-2 border rounded" />
                            <ErrorMessage name="postalCode" component="p" className="text-red-500 text-xs" />
                            <Field as="textarea" name="fullAddress" placeholder="Full Address (Street name, building, house number)" className="w-full p-2 border rounded" />
                            <ErrorMessage name="fullAddress" component="p" className="text-red-500 text-xs" />
                            <div className="flex items-center">
                                <Field type="checkbox" name="primary" id="primary" className="h-4 w-4 text-emerald-600 border-gray-300 rounded" />
                                <label htmlFor="primary" className="ml-2 block text-sm text-gray-900">Set as primary address</label>
                            </div>
                            <div className="flex justify-end space-x-4 mt-6">
                                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg">Cancel</button>
                                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-emerald-600 text-white rounded-lg disabled:bg-emerald-400">
                                    {isSubmitting ? 'Saving...' : 'Save Address'}
                                </button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
};