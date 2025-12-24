import { apiClient } from "./client";

export type POStatus = "pending" | "acknowledged" | "completed" | "canceled";

export interface PurchaseOrder {
  id: number;
  po_number: string;
  vendor: number;
  order_date: string;
  expected_delivery_date: string;
  actual_delivery_date: string | null;
  items: Record<string, unknown>;
  quantity: number;
  status: POStatus;
  quality_rating: number | null;
  issue_date: string;
  acknowledgment_date: string | null;
}

export type PurchaseOrderPayload = Omit<
  PurchaseOrder,
  "id" | "acknowledgment_date"
>;

import type { PaginatedResponse } from "./vendors";

export interface PurchaseOrderQuery {
  vendor?: number;
  page?: number;
}

export async function listPurchaseOrders(params?: PurchaseOrderQuery) {
  const res = await apiClient.get<PaginatedResponse<PurchaseOrder>>(
    "/purchase_orders/",
    {
      params,
    }
  );
  return res.data;
}

export async function getPurchaseOrder(id: number) {
  const res = await apiClient.get<PurchaseOrder>(`/purchase_orders/${id}/`);
  return res.data;
}

export async function createPurchaseOrder(data: PurchaseOrderPayload) {
  const res = await apiClient.post<PurchaseOrder>("/purchase_orders/", data);
  return res.data;
}

export async function updatePurchaseOrder(
  id: number,
  data: Partial<PurchaseOrderPayload>,
) {
  const res = await apiClient.patch<PurchaseOrder>(
    `/purchase_orders/${id}/`,
    data,
  );
  return res.data;
}

export async function deletePurchaseOrder(id: number) {
  await apiClient.delete(`/purchase_orders/${id}/`);
}

export async function acknowledgePurchaseOrder(id: number) {
  const res = await apiClient.post<PurchaseOrder>(
    `/purchase_orders/${id}/acknowledge/`,
  );
  return res.data;
}


