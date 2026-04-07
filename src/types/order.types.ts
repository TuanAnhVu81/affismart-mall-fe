export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "CONFIRMED"
  | "SHIPPED"
  | "DONE"
  | "CANCELLED";

export interface CreateOrderItemPayload {
  productId: number;
  quantity: number;
}

export interface CreateOrderPayload {
  shippingAddress: string;
  items: CreateOrderItemPayload[];
  refCode?: string;
}

export interface CreateOrderResponse {
  orderId: number;
}

export interface PaymentSessionResponse {
  paymentUrl: string;
}

export interface OrderSummary {
  id: number;
  status: OrderStatus;
  totalAmount: number;
  shippingAddress: string;
  createdAt: string;
}

export interface OrderListResponse {
  content: OrderSummary[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface GetMyOrdersParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

