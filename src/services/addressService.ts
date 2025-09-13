import apiClient from './apiClient';
import { AddressFormValues } from '@/types/address'; 

export const getAddresses = async () => {
  return apiClient.get('/users/addresses');
};
export const createAddress = async (payload: AddressFormValues) => {
  return apiClient.post('/users/addresses', payload);
};
export const updateAddress = async (addressId: string, payload: AddressFormValues) => {
  return apiClient.put(`/users/addresses/${addressId}`, payload);
};


export const deleteAddress = async (addressId: string) => {
  return apiClient.delete(`/users/addresses/${addressId}`);
};
