import { PaginationInfo } from "./common";

export interface CreateDiscountDTO {
  name: string,
  description: string,
  value: number,
  minPurchase: number,
  startAt: string,
  endAt: string,
  type: string
}

export interface Discount {
  id: string,
  name: string,
  description: string,
  value: number,
  minPurchase: number,
  startAt: string,
  endAt: string,
  type: string,
  unit: string
}

export interface DiscountsApiResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
    content: Discount[];
  };
}

export interface DiscountState {
  pagination: PaginationInfo | null;
  discounts: Discount[];
  loading: boolean;
  error: string | null;
  fetchDiscount: () => Promise<void>;
  createDiscount: (data: CreateDiscountDTO) => Promise<void>;
}