import { api } from "../../lib/api";

export interface PaymentLinkResponse {
  message: string;
  orderNumber: string;
  paymentLinkUrl: string;
  amount: number;
  amountFormatted: string;
  expiresAt: string;
}

export const createPaymentLink = async (
  orderId: string,
): Promise<PaymentLinkResponse> => {
  const { data } = await api.post("/payments/create-link", { orderId });
  return data;
};

export interface ManualOrderItem {
  productId: string;
  variantId: string;
  quantity: number;
}

export interface ManualOrderInput {
  userId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  items: ManualOrderItem[];
}

export interface ManualOrderResponse {
  message: string;
  orderNumber: string;
  order: any;
  paymentLink: {
    url: string;
    amount: number;
    amountFormatted: string;
    expiresAt: string;
  };
}

export interface PaymentLinkStatus {
  status: string; // Razorpay raw: created | paid | expired | cancelled
  isPaid: boolean;
  alreadyPaid: boolean;
  expiresAt: string | null;
  amountPaid: number;
  order?: any;
}

export const createManualOrder = async (
  input: ManualOrderInput,
): Promise<ManualOrderResponse> => {
  const { data } = await api.post("/orders/admin/manual", input);
  return data;
};

export const checkPaymentLinkStatus = async (
  orderId: string,
): Promise<PaymentLinkStatus> => {
  const { data } = await api.post("/payments/check-link-status", { orderId });
  return data;
};
