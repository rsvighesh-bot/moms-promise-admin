import { api } from "../../lib/api";

export interface TopScrollMessage {
  _id: string;
  text: string;
  status: "active" | "inactive";
}

// Admin GET always returns the singleton, auto-created on first call —
// no list, no ID needed, there's only ever one of these.
export const fetchTopScrollAdmin = async (): Promise<TopScrollMessage> => {
  const { data } = await api.get("/top-scroll/admin");
  return data.message;
};

export const updateTopScroll = async (input: {
  text?: string;
  status?: "active" | "inactive";
}): Promise<TopScrollMessage> => {
  const { data } = await api.put("/top-scroll/admin", input);
  return data.message;
};
