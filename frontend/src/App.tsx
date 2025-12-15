import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { MainLayout } from "./components/layout/main-layout";
import { AuthGuard } from "./components/layout/auth-guard";
import { LoginPage } from "./pages/auth/login";
import { VendorsPage } from "./pages/vendors";

function Home() {
  return (
    <div className="text-center py-12">
      <h2 className="text-2xl font-bold mb-4">Welcome to Vendor Management System</h2>
      <p>Get started by navigating to Vendors or Purchase Orders.</p>
    </div>
  );
}

function Page({ title }: { title: string }) {
  return (
    <div className="py-4">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-2">This is the {title.toLowerCase()} page.</p>
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
          { path: "/purchase-orders", element: <Page title="Purchase Orders" /> },
        ],
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;