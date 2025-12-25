import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { MainLayout } from "./components/layout/main-layout";
import { VendorLayout } from "./components/layout/vendor-layout";
import { AuthGuard } from "./components/layout/auth-guard";
import { AdminGuard } from "./components/layout/admin-guard";
import { VendorGuard } from "./components/layout/vendor-guard";
import { LoginPage } from "./pages/auth/login";
import { RegisterPage } from "./pages/auth/register";
import { VendorsPage } from "./pages/vendors";
import { PurchaseOrdersPage } from "./pages/purchase-orders";
import { DashboardPage } from "./pages/dashboard";
import { VendorDashboardPage } from "./pages/vendor/dashboard";
import { VendorPurchaseOrdersPage } from "./pages/vendor/purchase-orders";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    element: <AuthGuard />,
    children: [
      {
        element: <AdminGuard />,
    children: [
      {
        path: "/",
        element: <MainLayout />,
        children: [
          { path: "/", element: <DashboardPage /> },
          { path: "/vendors", element: <VendorsPage /> },
          { path: "/purchase-orders", element: <PurchaseOrdersPage /> },
            ],
          },
        ],
      },
      {
        element: <VendorGuard />,
        children: [
      {
        path: "/vendor",
        element: <VendorLayout />,
        children: [
          { path: "/vendor/dashboard", element: <VendorDashboardPage /> },
          { path: "/vendor/purchase-orders", element: <VendorPurchaseOrdersPage /> },
            ],
          },
        ],
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;