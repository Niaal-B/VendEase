import { useEffect, useState } from "react";
import { listVendorPurchaseOrders } from "@/api/vendorPurchaseOrders";
import type { PurchaseOrder } from "@/api/purchaseOrders";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";

function getStatusBadge(status: PurchaseOrder["status"]) {
  const variants: Record<PurchaseOrder["status"], { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
    pending: { variant: "outline", label: "Pending" },
    acknowledged: { variant: "secondary", label: "Acknowledged" },
    completed: { variant: "default", label: "Completed" },
    canceled: { variant: "destructive", label: "Canceled" },
  };
  return variants[status];
}

export function VendorDashboardPage() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await listVendorPurchaseOrders(currentPage);
        setPurchaseOrders(data.results);
        setTotalCount(data.count);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentPage]);

  // Calculate metrics
  const stats = {
    totalPOs: totalCount,
    pendingPOs: purchaseOrders.filter((po) => po.status === "pending").length,
    acknowledgedPOs: purchaseOrders.filter((po) => po.status === "acknowledged").length,
    completedPOs: purchaseOrders.filter((po) => po.status === "completed").length,
    canceledPOs: purchaseOrders.filter((po) => po.status === "canceled").length,
  };

  if (loading && purchaseOrders.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vendor Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Overview of your purchase orders and performance
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Vendor Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Overview of your purchase orders and performance
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPOs}</div>
            <p className="text-xs text-muted-foreground">All purchase orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingPOs}</div>
            <p className="text-xs text-muted-foreground">Awaiting acknowledgment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Acknowledged</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.acknowledgedPOs}</div>
            <p className="text-xs text-muted-foreground">Confirmed orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedPOs}</div>
            <p className="text-xs text-muted-foreground">Delivered orders</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Purchase Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Purchase Orders</CardTitle>
          <CardDescription>
            Your latest purchase orders and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : purchaseOrders.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No purchase orders yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {purchaseOrders.slice(0, 5).map((po) => {
                const statusBadge = getStatusBadge(po.status);
                return (
                  <div
                    key={po.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold">{po.po_number}</h3>
                        <Badge variant={statusBadge.variant}>
                          {statusBadge.label}
                        </Badge>
                      </div>
                      <div className="mt-2 text-sm text-muted-foreground">
                        <p>
                          Order Date: {new Date(po.order_date).toLocaleDateString()}
                        </p>
                        <p>
                          Expected Delivery:{" "}
                          {new Date(po.expected_delivery_date).toLocaleDateString()}
                        </p>
                        <p>Quantity: {po.quantity}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {po.status === "pending" && (
                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                      )}
                      {po.status === "acknowledged" && (
                        <CheckCircle2 className="h-5 w-5 text-blue-600" />
                      )}
                      {po.status === "completed" && (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      )}
                      {po.status === "canceled" && (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

