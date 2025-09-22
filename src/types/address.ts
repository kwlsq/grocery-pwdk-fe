export interface Address {
    id: string;
    label: string;
    recipientName: string;
    phone: string;
    fullAddress: string;
    city: string;
    province: string;
    postalCode: string;
    primary: boolean;
}

export interface AddressFormValues {
    label: string;
    recipientName: string;
    phone: string;
    fullAddress: string;
    provinceId: number;
    cityId: number;
    postalCode: string;
    primary: boolean;
}
export interface Province {
    id: number;
    name: string;
}
export interface City {
    id: number;
    name: string;
}
export interface AddressPayload {
    label: string;
    recipientName: string;
    phone: string;
    fullAddress: string;
    provinceId: number;
    cityId: number;
    postalCode: string;
    isPrimary: boolean;
}