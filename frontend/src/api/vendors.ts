import { apiClient } from "./client";

export interface Vendor {
  id: number;
  name: string;
  contact_details: string;
  address: string;
  vendor_code: string;
  on_time_delivery_rate: number;
  quality_rating_avg: number;
  average_response_time: number;
  fulfillment_rate: number;
}

export type VendorPayload = Omit<
  Vendor,
  | "id"
  | "on_time_delivery_rate"
  | "quality_rating_avg"
  | "average_response_time"
  | "fulfillment_rate"
>;

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ListVendorsParams {
  page?: number;
}

export async function listVendors(params?: ListVendorsParams) {
  const res = await apiClient.get<PaginatedResponse<Vendor>>("/vendors/", {
    params: params ? { page: params.page } : undefined,
  });
  return res.data;
}

export async function createVendor(data: VendorPayload) {
  const res = await apiClient.post<Vendor>("/vendors/", data);
  return res.data;
}

export async function updateVendor(id: number, data: VendorPayload) {
  const res = await apiClient.put<Vendor>(`/vendors/${id}/`, data);
  return res.data;
}

export async function deleteVendor(id: number) {
  await apiClient.delete(`/vendors/${id}/`);
}


