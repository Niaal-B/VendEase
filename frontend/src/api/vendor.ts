import { apiClient } from "./client";
import type { Vendor } from "./vendors";

export async function getVendorProfile() {
  // Get the current user's vendor profile
  // We'll need to add an endpoint for this, or we can get it from the user endpoint
  // For now, let's create a simple endpoint that returns the vendor profile
  const res = await apiClient.get<Vendor>("/vendor/profile/");
  return res.data;
}

