import { Outlet } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4">
          <h1 className="text-xl font-bold">Vendor Management</h1>
          <nav className="flex gap-4">
            <Button variant="ghost" asChild>
              <a href="/vendors">Vendors</a>
            </Button>
            <Button variant="ghost" asChild>
              <a href="/purchase-orders">Purchase Orders</a>
            </Button>
          </nav>
        </div>
      </header>
      <main className="flex-1 container py-8">
        <Outlet />
      </main>
    </div>
  );
}