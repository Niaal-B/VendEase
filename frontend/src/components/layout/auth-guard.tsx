import { Navigate, Outlet } from "react-router-dom";
import { getAccessToken } from "@/api/client";

export function AuthGuard() {
  const token = getAccessToken();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}


