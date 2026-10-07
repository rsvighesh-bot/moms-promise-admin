import { api } from "../../lib/api";

export type ShipmentStatus =
  | "pending"
  | "picked_up"
  | "in_transit"
  | "out_for_delivery"
  | "delivered"
  | "returned"
  | "rto"
  | "cancelled";

export type ShipmentType = "forward" | "reverse";

export interface ShipmentStatusHistory {
  status: string;
  rawStatus: string;
  timestamp: string;
  location?: string;
}

export interface Shipment {
  _id: string;
  orderId: string;
  orderNumber: string;
  type: ShipmentType;
  awbNumber: string;
  delhiveryShipmentId?: string;
  status: ShipmentStatus;
  statusHistory: ShipmentStatusHistory[];
  warehouseName: string;
  weight: number;
  codAmount?: number;
  deliveredAt?: string;
  createdAt: string;
}

export interface OrderShippingRate {
  orderNumber: string;
  destinationPincode: string;
  paymentMode: string;
  orderValue: string;
  weight: string;
  zone: string;
  shippingCost: {
    breakdown: {
      baseDeliveryCharge: number;
      handlingCharge: number;
      lastMileCharge: number;
      peakSurcharge: number;
      codCharge: number;
      grossAmount: number;
      sgst: number;
      cgst: number;
      igst: number;
      totalTax: number;
    };
    totalAmount: number;
    totalAmountFormatted: string;
  };
}

export const fetchShipmentByOrderId = async (
  orderId: string,
): Promise<Shipment | null> => {
  try {
    const { data } = await api.get(`/shipping/track/order-admin/${orderId}`);
    return data.shipment;
  } catch (err: any) {
    if (err?.response?.status === 404) return null;
    throw err;
  }
};

export const createShipment = async (params: {
  orderNumber: string;
  weight: number;
}): Promise<{ awbNumber: string; shipment: Shipment }> => {
  const { data } = await api.post("/shipping/create-shipment", params);
  return data;
};

export const syncShipmentStatus = async (
  awbNumber: string,
): Promise<Shipment> => {
  const { data } = await api.post(`/shipping/sync/${awbNumber}`);
  return data.shipment;
};

export const createReturn = async (
  orderNumber: string,
): Promise<{
  awbNumber: string;
  shipment: Shipment;
}> => {
  const { data } = await api.post(`/shipping/return/${orderNumber}`);
  return data;
};

export const fetchOrderShippingRate = async (
  orderNumber: string,
  weight: number,
): Promise<OrderShippingRate> => {
  const { data } = await api.get("/shipping/order-rate", {
    params: { orderNumber, weight },
  });
  return data;
};

export const fetchShippingLabel = async (
  awbNumber: string,
  size: "A4" | "4R",
): Promise<{ awbNumber: string; size: string; labelUrl: string }> => {
  const { data } = await api.get(`/shipping/label/${awbNumber}`, {
    params: { size },
  });
  return data;
};

export const createPickupRequest = async (params: {
  pickupDate: string;
  pickupTime: string;
  expectedPackageCount: number;
}): Promise<{
  message: string;
  pickupDate: string;
  pickupTime: string;
  expectedPackageCount: number;
  warehouse: string;
}> => {
  const { data } = await api.post("/shipping/pickup-request", params);
  return data;
};
