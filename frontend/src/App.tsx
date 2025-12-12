import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { MainLayout } from './components/layout/main-layout';

// Create a simple home page
function Home() {
  return (
    <div className="text-center py-12">
      <h2 className="text-2xl font-bold mb-4">Welcome to Vendor Management System</h2>
      <p>Get started by navigating to Vendors or Purchase Orders.</p>
    </div>
  );
}

// Create a simple page component
function Page({ title }: { title: string }) {
  return (
    <div className="py-4">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-2">This is the {title.toLowerCase()} page.</p>
    </div>
  );
}

// Set up the router
const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/vendors', element: <Page title="Vendors" /> },
      { path: '/purchase-orders', element: <Page title="Purchase Orders" /> },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;