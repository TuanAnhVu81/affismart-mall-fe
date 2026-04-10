import api from "@/services/api";
import type {
  CreateOrderPayload,
  CreateOrderResponse,
  GetMyOrdersParams,
  OrderDetail,
  OrderItemDetail,
  OrderListResponse,
  OrderSummary,
  PaymentSessionResponse,
} from "@/types/order.types";

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

interface CreateOrderResponsePayload {
  order_id?: number;
}

interface PaymentSessionPayload {
  payment_url?: string;
}

interface OrderSummaryPayload {
  id: number;
  status: string;
  total_amount: number | string;
  shipping_address: string;
  created_at: string;
}

interface OrderItemDetailPayload {
  product_id: number;
  product_name: string;
  product_sku?: string | null;
  quantity: number;
  price_at_time: number | string;
  line_total: number | string;
}

interface OrderDetailPayload {
  id: number;
  status: string;
  total_amount: number | string;
  discount_amount?: number | string | null;
  shipping_address: string;
  created_at: string;
  updated_at: string;
  items: OrderItemDetailPayload[];
}

interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  total_elements: number;
  total_pages: number;
  last: boolean;
}

const unwrapData = <T>(payload: ApiResponse<T> | T, errorMessage: string): T => {
  const data =
    payload && typeof payload === "object" && "data" in payload
      ? payload.data
      : payload;

  if (data === undefined || data === null) {
    throw new Error(errorMessage);
  }

  return data as T;
};

const parseCookie = (name: string) => {
  if (typeof document === "undefined") {
    return undefined;
  }

  const target = `${encodeURIComponent(name)}=`;
  const found = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(target));

  if (!found) {
    return undefined;
  }

  const value = found.slice(target.length);
  return value ? decodeURIComponent(value) : undefined;
};

const toCreateOrderRequestBody = (payload: CreateOrderPayload) => ({
  shipping_address: payload.shippingAddress.trim(),
  ref_code: payload.refCode ?? parseCookie("ref_code"),
  items: payload.items.map((item) => ({
    product_id: item.productId,
    quantity: item.quantity,
  })),
});

const toOrderSummary = (payload: OrderSummaryPayload): OrderSummary => ({
  id: payload.id,
  status: payload.status as OrderSummary["status"],
  totalAmount: Number(payload.total_amount),
  shippingAddress: payload.shipping_address,
  createdAt: payload.created_at,
});

const toOrderItemDetail = (payload: OrderItemDetailPayload): OrderItemDetail => ({
  productId: payload.product_id,
  productName: payload.product_name,
  productSku: payload.product_sku ?? null,
  quantity: payload.quantity,
  priceAtTime: Number(payload.price_at_time),
  lineTotal: Number(payload.line_total),
});

const toOrderDetail = (payload: OrderDetailPayload): OrderDetail => ({
  id: payload.id,
  status: payload.status as OrderDetail["status"],
  totalAmount: Number(payload.total_amount),
  discountAmount: Number(payload.discount_amount ?? 0),
  shippingAddress: payload.shipping_address,
  createdAt: payload.created_at,
  updatedAt: payload.updated_at,
  items: payload.items.map(toOrderItemDetail),
});

const toOrderListResponse = (
  payload: PageResponse<OrderSummaryPayload>,
): OrderListResponse => ({
  content: payload.content.map(toOrderSummary),
  page: payload.page,
  size: payload.size,
  totalElements: payload.total_elements,
  totalPages: payload.total_pages,
  last: payload.last,
});

const sanitizeGetMyOrdersParams = (params: GetMyOrdersParams = {}) =>
  Object.fromEntries(
    [
      ["page", params.page],
      ["size", params.size],
      ["sortBy", params.sortBy],
      ["sortDir", params.sortDir],
    ].filter(([, value]) => value !== undefined && value !== null && value !== ""),
  );

export const createOrder = async (payload: CreateOrderPayload) => {
  const { data } = await api.post<ApiResponse<CreateOrderResponsePayload>>(
    "/orders",
    toCreateOrderRequestBody(payload),
  );

  const responsePayload = unwrapData(
    data,
    "Invalid create order response payload.",
  );

  if (!responsePayload.order_id) {
    throw new Error("Missing order_id from create order response.");
  }

  const response: CreateOrderResponse = {
    orderId: responsePayload.order_id,
  };

  return response;
};

export const createPaymentSession = async (orderId: number) => {
  const { data } = await api.post<ApiResponse<PaymentSessionPayload>>(
    "/payment/create-session",
    { order_id: orderId },
  );
  const payload = unwrapData(data, "Invalid payment session response payload.");

  if (!payload.payment_url) {
    throw new Error("Missing payment_url from payment session response.");
  }

  const response: PaymentSessionResponse = {
    paymentUrl: payload.payment_url,
  };

  return response;
};

export const getMyOrders = async (params: GetMyOrdersParams = {}) => {
  const { data } = await api.get<ApiResponse<PageResponse<OrderSummaryPayload>>>(
    "/orders/my",
    {
      params: sanitizeGetMyOrdersParams(params),
    },
  );
  const payload = unwrapData(data, "Invalid my orders response payload.");

  return toOrderListResponse(payload);
};

export const getMyOrderDetail = async (orderId: number) => {
  const { data } = await api.get<ApiResponse<OrderDetailPayload>>(
    `/orders/my/${orderId}`,
  );
  const payload = unwrapData(data, "Invalid order detail response payload.");

  return toOrderDetail(payload);
};

export const cancelOrder = async (orderId: number) => {
  await api.put(`/orders/my/${orderId}/cancel`);
};
