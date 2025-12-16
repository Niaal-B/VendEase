import { Outlet, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { logout } from "@/api/client";
import { Logo } from "@/components/ui/logo";

export function MainLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4">
          <Link to="/" className="hover:opacity-80 transition-opacity">
            <Logo />
          </Link>
          <nav className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link to="/">Dashboard</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/vendors">Vendors</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/purchase-orders">Purchase Orders</Link>
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Logout
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