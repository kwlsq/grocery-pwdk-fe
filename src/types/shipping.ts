import { Address } from "./address";

export interface CheckoutAddressResponse {
    addresses: Address[];
    primaryAddress: Address | null;
    hasAddresses: boolean;
}

export interface ShippingCalculationRequest {
    storeId: string;
    addressId: string;
    totalWeight: number; 
}

export interface ShippingOption {
    courier: string;
    service: string;
    serviceName: string;
    cost: number;
    etd: string;
    description: string;
}

export type ShippingApiResponse = 
  | ShippingOption[] 
  | { data: ShippingOption[] }
  | { shippingOptions: ShippingOption[] };

