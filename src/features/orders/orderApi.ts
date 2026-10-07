import { api } from "../../lib/api";

export type OrderStatus =
  | "placed"
  | "confirmed"
  | "packed"
  | "processing"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "return_requested"
  | "return_approved"
  | "return_rejected"
  | "returned"
  | "refunded"
  | "rto";

export type PaymentMode = "online" | "cod";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface OrderItem {
  productId: string;
  variantId: string;
  name: string;
  sku: string;
  age: string;
  color?: string;
  image?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  comboOfferId?: string | null;
  comboGroupId?: string | null;
  comboName?: string | null;
}

export interface OrderPricing {
  subtotal: number;
  discount: number;
  shippingFee: number;
  grandTotal: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  userId: { _id: string; name: string; email: string; phone?: string } | null;
  items: OrderItem[];
  addressSnapshot: {
    fullName: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
  };
  pricing: OrderPricing;
  couponCode?: string;
  paymentMode: PaymentMode;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  statusHistory: { status: string; timestamp: string; note?: string }[];
  returnReason?: string;
  returnRejectionReason?: string;
  createdAt: string;
}

export interface Payment {
  _id: string;
  status: string;
  method?: string;
  razorpayPaymentId?: string;
  refundId?: string;
  refundAmount?: number;
}

// List response uses "total" not "totalDocs"
export interface OrderListResponse {
  docs: Order[];
  total: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
}

export interface OrderFilters {
  orderStatus?: string;
  paymentMode?: string;
  paymentStatus?: string;
  search?: string;
  from?: string;
  to?: string;
}

export const fetchOrdersAdmin = async (
  filters: OrderFilters,
  page: number,
): Promise<OrderListResponse> => {
  const { data } = await api.get("/orders/admin", {
    params: { ...filters, status: filters.orderStatus, page, limit: 10 },
  });
  return data;
};

// Returns both order and payment
export const fetchOrderByNumberAdmin = async (
  orderNumber: string,
): Promise<{ order: Order; payment: Payment | null }> => {
  const { data } = await api.get(`/orders/admin/${orderNumber}`);
  return data;
};

// Generic status update — body uses "status" not "orderStatus"
export const updateOrderStatus = async (
  orderNumber: string,
  status: OrderStatus,
  note?: string,
): Promise<Order> => {
  const { data } = await api.put(`/orders/admin/${orderNumber}/status`, {
    status,
    note,
  });
  return data.order;
};

export const packOrder = async (
  orderNumber: string,
  note?: string,
): Promise<Order> => {
  const { data } = await api.post(`/orders/admin/${orderNumber}/pack`, {
    note,
  });
  return data.order;
};

export const approveReturn = async (
  orderNumber: string,
  note?: string,
): Promise<Order> => {
  const { data } = await api.post(
    `/orders/admin/${orderNumber}/approve-return`,
    { note },
  );
  return data.order;
};

export const rejectReturn = async (
  orderNumber: string,
  reason: string,
): Promise<Order> => {
  const { data } = await api.post(
    `/orders/admin/${orderNumber}/reject-return`,
    { reason },
  );
  return data.order;
};

export const markReturned = async (
  orderNumber: string,
  note?: string,
): Promise<Order> => {
  const { data } = await api.post(
    `/orders/admin/${orderNumber}/mark-returned`,
    { note },
  );
  return data.order;
};

export const markRefunded = async (
  orderNumber: string,
  note?: string,
): Promise<Order> => {
  const { data } = await api.post(
    `/orders/admin/${orderNumber}/mark-refunded`,
    { note },
  );
  return data.order;
};
