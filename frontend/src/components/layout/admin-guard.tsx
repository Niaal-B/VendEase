import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { isVendor } from "@/utils/userRole";
import { Skeleton } from "@/components/ui/skeleton";

export function AdminGuard() {
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

  // If user is not a vendor (admin), allow access to admin routes
  if (!isUserVendor) {
    return <Outlet />;
  }

  // If user is a vendor, redirect to vendor dashboard
  return <Navigate to="/vendor/dashboard" replace />;
}

