import { useEffect, useState } from "react";
import {
  listVendorPurchaseOrders,
  acknowledgeVendorPurchaseOrder,
  type PurchaseOrder,
  type POStatus,
} from "@/api/vendorPurchaseOrders";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Toast } from "@/components/ui/toast";
import { Pagination } from "@/components/ui/pagination";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { CheckCircle2, Package, Clock } from "lucide-react";

function getStatusBadge(status: POStatus) {
  const variants: Record<POStatus, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
    pending: { variant: "outline", label: "Pending" },
    acknowledged: { variant: "secondary", label: "Acknowledged" },
    completed: { variant: "default", label: "Completed" },
    canceled: { variant: "destructive", label: "Canceled" },
  };
  return variants[status];
}

export function VendorPurchaseOrdersPage() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [ackLoadingId, setAckLoadingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setSuccess(null);
      try {
        const data = await listVendorPurchaseOrders(currentPage);
        setPurchaseOrders(data.results);
        setTotalPages(Math.ceil(data.count / 10));
        setTotalCount(data.count);
      } catch (err) {
        console.error(err);
        setError("Failed to load purchase orders. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentPage]);

  useEffect(() => {
    if (!success) return;
    const id = setTimeout(() => setSuccess(null), 3000);
    return () => clearTimeout(id);
  }, [success]);

  const handleAcknowledge = async (id: number) => {
    setAckLoadingId(id);
    setError(null);
    try {
      const updated = await acknowledgeVendorPurchaseOrder(id);
      setPurchaseOrders((prev) =>
        prev.map((po) => (po.id === id ? updated : po))
      );
      setSuccess("Purchase order acknowledged successfully!");
      if (selectedPO?.id === id) {
        setSelectedPO(updated);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to acknowledge purchase order. Please try again.");
    } finally {
      setAckLoadingId(null);
    }
  };

  const handleViewDetails = (po: PurchaseOrder) => {
    setSelectedPO(po);
    setIsDetailDialogOpen(true);
  };

  const kpis = {
    total: totalCount,
    pending: purchaseOrders.filter((po) => po.status === "pending").length,
    acknowledged: purchaseOrders.filter((po) => po.status === "acknowledged").length,
    completed: purchaseOrders.filter((po) => po.status === "completed").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Purchase Orders</h1>
        <p className="text-muted-foreground mt-2">
          View and manage your purchase orders
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Acknowledged</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.acknowledged}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.completed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Purchase Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Purchase Orders</CardTitle>
          <CardDescription>
            Click on an order to view details or acknowledge
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && purchaseOrders.length === 0 ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : purchaseOrders.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No purchase orders found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {purchaseOrders.map((po) => {
                const statusBadge = getStatusBadge(po.status);
                return (
                  <div
                    key={po.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{po.po_number}</h3>
                        <Badge variant={statusBadge.variant}>
                          {statusBadge.label}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>
                          Order Date: {new Date(po.order_date).toLocaleString()}
                        </p>
                        <p>
                          Expected Delivery:{" "}
                          {new Date(po.expected_delivery_date).toLocaleDateString()}
                        </p>
                        <p>Quantity: {po.quantity}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(po)}
                      >
                        View Details
                      </Button>
                      {po.status === "pending" && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleAcknowledge(po.id)}
                          disabled={ackLoadingId === po.id}
                        >
                          {ackLoadingId === po.id ? (
                            "Acknowledging..."
                          ) : (
                            <>
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Acknowledge
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Purchase Order Details</DialogTitle>
            <DialogDescription>
              Complete information about this purchase order
            </DialogDescription>
          </DialogHeader>
          {selectedPO && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    PO Number
                  </Label>
                  <p className="font-semibold">{selectedPO.po_number}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Status
                  </Label>
                  <div>
                    <Badge variant={getStatusBadge(selectedPO.status).variant}>
                      {getStatusBadge(selectedPO.status).label}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Order Date
                  </Label>
                  <p>
                    {new Date(selectedPO.order_date).toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Issue Date
                  </Label>
                  <p>
                    {new Date(selectedPO.issue_date).toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Expected Delivery
                  </Label>
                  <p>
                    {new Date(selectedPO.expected_delivery_date).toLocaleDateString()}
                  </p>
                </div>
                {selectedPO.actual_delivery_date && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Actual Delivery
                    </Label>
                    <p>
                      {new Date(selectedPO.actual_delivery_date).toLocaleString()}
                    </p>
                  </div>
                )}
                {selectedPO.acknowledgment_date && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Acknowledgment Date
                    </Label>
                    <p>
                      {new Date(selectedPO.acknowledgment_date).toLocaleString()}
                    </p>
                  </div>
                )}
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Quantity
                  </Label>
                  <p>{selectedPO.quantity}</p>
                </div>
                {selectedPO.quality_rating && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Quality Rating
                    </Label>
                    <p>{selectedPO.quality_rating}</p>
                  </div>
                )}
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">
                  Items
                </Label>
                <div className="mt-2 p-4 bg-muted rounded-lg">
                  <pre className="text-sm whitespace-pre-wrap">
                    {JSON.stringify(selectedPO.items, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            {selectedPO && selectedPO.status === "pending" && (
              <Button
                onClick={() => {
                  handleAcknowledge(selectedPO.id);
                  setIsDetailDialogOpen(false);
                }}
                disabled={ackLoadingId === selectedPO.id}
              >
                {ackLoadingId === selectedPO.id ? (
                  "Acknowledging..."
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Acknowledge Order
                  </>
                )}
              </Button>
            )}
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {error && (
        <Toast
          message={error}
          variant="destructive"
          onClose={() => setError(null)}
        />
      )}
      {success && (
        <Toast
          message={success}
          variant="default"
          onClose={() => setSuccess(null)}
        />
      )}
    </div>
  );
}

