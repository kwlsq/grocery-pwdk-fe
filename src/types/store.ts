export interface Store {
  id: string;
  name: string;
  description: string;
  address: string;
  active: boolean;
}

export interface StoreApiResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: Store[];
}
