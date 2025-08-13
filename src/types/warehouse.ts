export interface Warehouse {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  active: boolean;
}

export interface WarehouseApiResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: Warehouse[];
}
