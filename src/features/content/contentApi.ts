import { api } from "../../lib/api";

export interface ContentDoc {
  _id: string;
  short: string;
  detailed: string;
  updatedAt: string;
}

export const fetchShippingReturn = async (): Promise<ContentDoc> => {
  const { data } = await api.get("/shipping-return");
  return data.shippingReturn;
};

export const updateShippingReturn = async (input: {
  short?: string;
  detailed?: string;
}): Promise<ContentDoc> => {
  const { data } = await api.put("/shipping-return", input);
  return data.shippingReturn;
};

export const fetchTerms = async (): Promise<ContentDoc> => {
  const { data } = await api.get("/terms");
  return data.terms;
};

export const updateTerms = async (input: {
  short?: string;
  detailed?: string;
}): Promise<ContentDoc> => {
  const { data } = await api.put("/terms", input);
  return data.terms;
};
