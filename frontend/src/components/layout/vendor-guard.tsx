import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { isVendor } from "@/utils/userRole";
import { Skeleton } from "@/components/ui/skeleton";

export function VendorGuard() {
  const [loading, setLoading] = useState(true);
  const [isUserVendor, setIsUserVendor] = useState(false);

  useEffect(() => {
    const checkRole = async () => {
      try {
        const vendor = await isVendor();
        setIsUserVendor(vendor);
      } catch (error) {
        setIsUserVendor(false);
      } finally {
        setLoading(false);
      }
    };
    checkRole();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Skeleton className="h-8 w-8" />
      </div>
    );
  }

  // If user is a vendor, allow access to vendor routes
  if (isUserVendor) {
    return <Outlet />;
  }

  // If user is not a vendor (admin), redirect to admin dashboard
  return <Navigate to="/" replace />;
}

