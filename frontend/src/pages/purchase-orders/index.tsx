import { useEffect, useMemo, useState } from "react";
import {
  listPurchaseOrders,
  createPurchaseOrder,
  updatePurchaseOrder,
  deletePurchaseOrder,
  acknowledgePurchaseOrder,
  type PurchaseOrder,
  type PurchaseOrderPayload,
  type POStatus,
} from "@/api/purchaseOrders";
import { listVendors, type Vendor } from "@/api/vendors";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

type FormMode = "create" | "edit";

type ItemPair = {
  key: string;
  value: string;
};

type PurchaseOrderForm = {
  vendor: string;          // vendor id as string
  po_number: string;
  expected_delivery_date: string;
  quantity: string;
  status: POStatus;
  quality_rating: string;
  items: ItemPair[];      // Array of key-value pairs
};

const emptyForm: PurchaseOrderForm = {
  vendor: "",
  po_number: "",
  expected_delivery_date: "",
  quantity: "",
  status: "pending",
  quality_rating: "",
  items: [],
};

export function PurchaseOrdersPage() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [ackLoadingId, setAckLoadingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formMode, setFormMode] = useState<FormMode>("create");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [form, setForm] = useState<PurchaseOrderForm>(emptyForm);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [poToDelete, setPoToDelete] = useState<PurchaseOrder | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      setSuccess(null);
      try {
        const [pos, vs] = await Promise.all([listPurchaseOrders(), listVendors()]);
        setPurchaseOrders(pos);
        setVendors(vs);
      } catch (err) {
        console.error(err);
        setError("Failed to load purchase orders. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  useEffect(() => {
    if (!success) return;
    const id = setTimeout(() => setSuccess(null), 3000);
    return () => clearTimeout(id);
  }, [success]);

  const vendorMap = useMemo(
    () => new Map(vendors.map((v) => [v.id, v] as const)),
    [vendors],
  );

  const kpis = useMemo(() => {
    if (!purchaseOrders.length) {
      return {
        total: 0,
        completed: 0,
        pending: 0,
        acknowledged: 0,
      };
    }
    let completed = 0;
    let pending = 0;
    let acknowledged = 0;

    purchaseOrders.forEach((po) => {
      if (po.status === "completed") completed += 1;
      else if (po.status === "pending") pending += 1;
      else if (po.status === "acknowledged") acknowledged += 1;
    });

    return {
      total: purchaseOrders.length,
      completed,
      pending,
      acknowledged,
    };
  }, [purchaseOrders]);

  const openCreateDialog = () => {
    setFormMode("create");
    setSelectedId(null);
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 16);

    setForm({
      ...emptyForm,
      expected_delivery_date: tomorrow,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (po: PurchaseOrder) => {
    setFormMode("edit");
    setSelectedId(po.id);
    const itemsObj = po.items ?? {};
    const itemsArray: ItemPair[] = Object.entries(itemsObj).map(([key, value]) => ({
      key,
      value: String(value),
    }));
    setForm({
      vendor: String(po.vendor),
      po_number: po.po_number,
      expected_delivery_date: po.expected_delivery_date.slice(0, 16),
      quantity: String(po.quantity),
      status: po.status,
      quality_rating: po.quality_rating != null ? String(po.quality_rating) : "",
      items: itemsArray,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormMode("create");
    setSelectedId(null);
    setForm(emptyForm);
  };

  const handleFieldChange = (field: keyof PurchaseOrderForm, value: string | ItemPair[]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddItem = () => {
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, { key: "", value: "" }],
    }));
  };

  const handleRemoveItem = (index: number) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleItemChange = (index: number, field: "key" | "value", value: string) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);
  
    if (!form.vendor) {
      setError("Vendor is required.");
      setSubmitting(false);
      return;
    }
  
    // Convert items array to object, filtering out empty keys
    const parsedItems: Record<string, unknown> = {};
    form.items.forEach((item) => {
      if (item.key.trim()) {
        // Try to parse value as number if possible, otherwise keep as string
        const numValue = Number(item.value);
        parsedItems[item.key.trim()] = isNaN(numValue) ? item.value : numValue;
      }
    });
  
    

    const nowIso = new Date().toISOString();
    const basePayload: PurchaseOrderPayload = {
      po_number: form.po_number,
      vendor: Number(form.vendor),
      order_date: nowIso,
      expected_delivery_date:
        form.expected_delivery_date || nowIso,
      actual_delivery_date: null,
      items: parsedItems,
      quantity: Number(form.quantity) || 0,
      status: form.status,
      quality_rating: form.quality_rating
        ? parseFloat(form.quality_rating)
        : null,
      issue_date: nowIso,
    };

    try {
      if (formMode === "create") {
        const created = await createPurchaseOrder(basePayload);
        setPurchaseOrders((prev) => [created, ...prev]);
        setSuccess("Purchase order created successfully.");
      } else if (formMode === "edit" && selectedId != null) {
        const updated = await updatePurchaseOrder(selectedId, basePayload);
        setPurchaseOrders((prev) =>
          prev.map((po) => (po.id === updated.id ? updated : po)),
        );
        setSuccess("Purchase order updated successfully.");
      }
      resetForm();
      setIsDialogOpen(false);
    } catch (err) {
      console.error(err);
      setError(
        "Failed to save purchase order. Please check the data and try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (po: PurchaseOrder, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setPoToDelete(po);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!poToDelete) return;
    try {
      setError(null);
      setSuccess(null);
      await deletePurchaseOrder(poToDelete.id);
      setPurchaseOrders((prev) => prev.filter((p) => p.id !== poToDelete.id));
      setSuccess("Purchase order deleted successfully.");
    } catch (err) {
      console.error(err);
      setError("Failed to delete purchase order. Please try again.");
    } finally {
      setIsDeleteDialogOpen(false);
      setPoToDelete(null);
    }
  };

  const handleAcknowledge = async (po: PurchaseOrder) => {
    try {
      setAckLoadingId(po.id);
      setError(null);
      setSuccess(null);
      const updated = await acknowledgePurchaseOrder(po.id);
      setPurchaseOrders((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p)),
      );
      setSuccess("Purchase order acknowledged.");
    } catch (err) {
      console.error(err);
      setError("Failed to acknowledge purchase order.");
    } finally {
      setAckLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="py-3">
            <CardDescription>Total POs</CardDescription>
            <CardTitle className="text-2xl">{kpis.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="py-3">
            <CardDescription>Completed</CardDescription>
            <CardTitle className="text-2xl">{kpis.completed}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="py-3">
            <CardDescription>Pending</CardDescription>
            <CardTitle className="text-2xl">{kpis.pending}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="py-3">
            <CardDescription>Acknowledged</CardDescription>
            <CardTitle className="text-2xl">{kpis.acknowledged}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-6">
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Purchase Orders</CardTitle>
              <CardDescription>
                Track purchase orders and vendor performance inputs.
              </CardDescription>
            </div>
            <Button size="sm" onClick={openCreateDialog}>
              + Add PO
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                Loading purchase orders...
              </div>
            ) : purchaseOrders.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                No purchase orders yet. Use “Add PO” to create one.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40 border-b">
                    <tr className="text-left">
                      <th className="px-4 py-2 font-medium">PO #</th>
                      <th className="px-4 py-2 font-medium">Vendor</th>
                      <th className="px-4 py-2 font-medium hidden md:table-cell">
                        Status
                      </th>
                      <th className="px-4 py-2 font-medium hidden md:table-cell">
                        Expected
                      </th>
                      <th className="px-4 py-2 font-medium hidden lg:table-cell">
                        Quantity
                      </th>
                      <th className="px-4 py-2 font-medium hidden lg:table-cell">
                        Quality
                      </th>
                      <th className="px-4 py-2 font-medium text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchaseOrders.map((po) => {
                      const vendor = vendorMap.get(po.vendor);
                      return (
                        <tr
                          key={po.id}
                          className="border-b last:border-0 hover:bg-muted/40 cursor-pointer"
                          onClick={() => openEditDialog(po)}
                        >
                          <td className="px-4 py-2 font-medium">{po.po_number}</td>
                          <td className="px-4 py-2">
                            <div className="text-sm">
                              {vendor ? vendor.name : `Vendor #${po.vendor}`}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {vendor?.vendor_code}
                            </div>
                          </td>
                          <td className="px-4 py-2 hidden md:table-cell capitalize">
                            {po.status}
                          </td>
                          <td className="px-4 py-2 hidden md:table-cell">
                            {new Date(po.expected_delivery_date).toLocaleString()}
                          </td>
                          <td className="px-4 py-2 hidden lg:table-cell">
                            {po.quantity}
                          </td>
                          <td className="px-4 py-2 hidden lg:table-cell">
                            {po.quality_rating != null
                              ? po.quality_rating.toFixed(2)
                              : "-"}
                          </td>
                          <td className="px-4 py-2">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditDialog(po);
                                }}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive"
                                onClick={(e) => handleDeleteClick(po, e)}
                              >
                                Delete
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={
                                  (po.status !== "pending" &&
                                    po.status !== "acknowledged") ||
                                  ackLoadingId === po.id
                                }
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAcknowledge(po);
                                }}
                              >
                                {ackLoadingId === po.id
                                  ? "Acknowledging..."
                                  : po.status === "acknowledged"
                                  ? "Re-ack"
                                  : "Acknowledge"}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            {error && !loading && (
              <div className="px-4 py-3 text-sm text-destructive border-t bg-destructive/10">
                {error}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {formMode === "create" ? "Add purchase order" : "Edit purchase order"}
            </DialogTitle>
            <DialogDescription>
              {formMode === "create"
                ? "Provide purchase order details."
                : "Update purchase order details and save your changes."}
            </DialogDescription>
          </DialogHeader>

          {/* Simplified, professional 2-column form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="vendor">Vendor</Label>
                <select
                  id="vendor"
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                  value={form.vendor}
                  onChange={(e) => handleFieldChange("vendor", e.target.value)}
                  required
                >
                  <option value="">Select vendor</option>
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.vendor_code})
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="po_number">PO number</Label>
                <Input
                  id="po_number"
                  value={form.po_number}
                  onChange={(e) => handleFieldChange("po_number", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="expected_delivery_date">Expected delivery</Label>
                <Input
                  id="expected_delivery_date"
                  type="datetime-local"
                  value={form.expected_delivery_date}
                  onChange={(e) =>
                    handleFieldChange("expected_delivery_date", e.target.value)
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min={0}
                  value={form.quantity}
                  onChange={(e) => handleFieldChange("quantity", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                  value={form.status}
                  onChange={(e) =>
                    handleFieldChange("status", e.target.value as POStatus)
                  }
                  required
                >
                  <option value="pending">Pending</option>
                  <option value="acknowledged">Acknowledged</option>
                  <option value="completed">Completed</option>
                  <option value="canceled">Canceled</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quality_rating">
                  Quality rating (optional, 0–5)
                </Label>
                <Input
                  id="quality_rating"
                  type="number"
                  step="0.1"
                  min={0}
                  max={5}
                  value={form.quality_rating}
                  onChange={(e) =>
                    handleFieldChange("quality_rating", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="items">Item Details (optional)</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddItem}
                >
                  + Add Item
                </Button>
              </div>
              {form.items.length === 0 ? (
                <div className="rounded-md border border-dashed border-input p-4 text-center text-sm text-muted-foreground">
                  No items added. Click "Add Item" to add item details.
                </div>
              ) : (
                <div className="space-y-2 rounded-md border border-input p-3">
                  {form.items.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="Key (e.g., product_name)"
                        value={item.key}
                        onChange={(e) =>
                          handleItemChange(index, "key", e.target.value)
                        }
                        className="flex-1"
                      />
                      <Input
                        placeholder="Value (e.g., Widget A)"
                        value={item.value}
                        onChange={(e) =>
                          handleItemChange(index, "value", e.target.value)
                        }
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Optional: Add custom item details as key-value pairs (e.g., product_name, unit_price, description).
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  resetForm();
                  setIsDialogOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting
                  ? "Saving..."
                  : formMode === "create"
                  ? "Create PO"
                  : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {success && (
        <div className="fixed bottom-4 right-4 z-50 rounded-lg bg-emerald-600 text-white px-4 py-3 shadow-lg text-sm">
          {success}
        </div>
      )}

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete purchase order</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-medium">
                {poToDelete?.po_number ?? "this purchase order"}
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setPoToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}