import apiClient from './apiClient'; // Use our central API client
import { CheckoutAddressResponse, ShippingCalculationRequest, ShippingOption } from '../types/shipping'; // We will create these types next

export const getCheckoutAddresses = () => {
  return apiClient.get<CheckoutAddressResponse>('/checkout/addresses');
};

export const calculateShippingOptions = (requestData: ShippingCalculationRequest) => {
  return apiClient.post<ShippingOption[]>('/checkout/shipping/calculate', requestData);
};
