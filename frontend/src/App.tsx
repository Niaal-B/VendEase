import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { MainLayout } from "./components/layout/main-layout";
import { AuthGuard } from "./components/layout/auth-guard";
import { LoginPage } from "./pages/auth/login";
import { VendorsPage } from "./pages/vendors";
import { PurchaseOrdersPage } from "./pages/purchase-orders";

function Home() {
  return (
    <div className="text-center py-12">
      <h2 className="text-2xl font-bold mb-4">Welcome to VendEase</h2>
      <p className="text-muted-foreground">Streamline your vendor management and track performance metrics.</p>
      <p className="mt-2 text-sm text-muted-foreground">Get started by navigating to Vendors or Purchase Orders.</p>
    </div>
  );
}

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
          { path: "/", element: <Home /> },
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