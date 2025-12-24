import { getVendorProfile } from "@/api/vendor";

/**
 * Check if the current user is a vendor by trying to fetch their vendor profile
 */
export async function isVendor(): Promise<boolean> {
  try {
    await getVendorProfile();
    return true;
  } catch (error: any) {
    // If 404 or 403, user is not a vendor
    if (error.response?.status === 404 || error.response?.status === 403) {
      return false;
    }
    // For other errors, assume not a vendor
    return false;
  }
}

