import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { MainLayout } from "./components/layout/main-layout";
import { AuthGuard } from "./components/layout/auth-guard";
import { LoginPage } from "./pages/auth/login";
import { VendorsPage } from "./pages/vendors";
import { PurchaseOrdersPage } from "./pages/purchase-orders";
import { DashboardPage } from "./pages/dashboard";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    element: <AuthGuard />,
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
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;