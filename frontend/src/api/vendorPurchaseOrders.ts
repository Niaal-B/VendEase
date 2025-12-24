import { apiClient } from "./client";
import type { PurchaseOrder, POStatus } from "./purchaseOrders";
import type { PaginatedResponse } from "./vendors";

export async function listVendorPurchaseOrders(page?: number) {
  const res = await apiClient.get<PaginatedResponse<PurchaseOrder>>(
    "/vendor/purchase_orders/",
    {
      params: page ? { page } : undefined,
    }
  );
  return res.data;
}

export async function getVendorPurchaseOrder(id: number) {
  const res = await apiClient.get<PurchaseOrder>(
    `/vendor/purchase_orders/${id}/`
  );
  return res.data;
}

export async function acknowledgeVendorPurchaseOrder(
  id: number,
  expected_delivery_date?: string
) {
  const res = await apiClient.post<PurchaseOrder>(
    `/vendor/purchase_orders/${id}/acknowledge/`,
    expected_delivery_date ? { expected_delivery_date } : undefined
  );
  return res.data;
}

