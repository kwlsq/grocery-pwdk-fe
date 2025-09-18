import { User } from "./user";

export interface Store {
    id: string;
    name: string;
    description?: string;
    address: string;
    latitude: number;
    longitude: number;
    isActive: boolean;
    storeManagers: User[];
}
export interface StoreRequestData {
    name: string;
    description?: string;
    address: string;
    latitude: number;
    longitude: number;
}