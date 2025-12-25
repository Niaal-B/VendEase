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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Toast } from "@/components/ui/toast";
import { Pagination } from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Edit, Trash2, CheckCircle2, Star } from "lucide-react";

type FormMode = "create" | "edit";

type ItemPair = {
  key: string;
  value: string;
};

type PurchaseOrderForm = {
  vendor: string;          
  po_number: string;
  order_date: string;
  expected_delivery_date: string;
  actual_delivery_date: string;
  quantity: string;
  status: POStatus;
  quality_rating: string;
  issue_date: string;
  acknowledgment_date: string;
  items: ItemPair[];      
};

const emptyForm: PurchaseOrderForm = {
  vendor: "",
  po_number: "",
  order_date: "",
  expected_delivery_date: "",
  actual_delivery_date: "",
  quantity: "",
  status: "pending",
  quality_rating: "",
  issue_date: "",
  acknowledgment_date: "",
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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [formMode, setFormMode] = useState<FormMode>("create");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [form, setForm] = useState<PurchaseOrderForm>(emptyForm);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [poToDelete, setPoToDelete] = useState<PurchaseOrder | null>(null);
  const [isRatingDialogOpen, setIsRatingDialogOpen] = useState(false);
  const [poToRate, setPoToRate] = useState<PurchaseOrder | null>(null);
  const [ratingValue, setRatingValue] = useState<string>("");
  const [ratingLoading, setRatingLoading] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      setSuccess(null);
      try {
        const [posData, vsData] = await Promise.all([
          listPurchaseOrders({ page: currentPage }),
          listVendors({ page: 1 }), 
        ]);
        setPurchaseOrders(posData.results);
        setTotalPages(Math.ceil(posData.count / 10));
        setVendors(vsData.results);
      } catch (err) {
        console.error(err);
        setError("Failed to load purchase orders. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [currentPage]);

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
    resetForm();
    setFieldErrors({});
    setIsDialogOpen(true);
  };

  const openEditDialog = (po: PurchaseOrder) => {
    setFormMode("edit");
    setSelectedId(po.id);
    setFieldErrors({});
    const itemsObj = po.items ?? {};
    const itemsArray: ItemPair[] = Object.entries(itemsObj).map(([key, value]) => ({
      key,
      value: String(value),
    }));
    setForm({
      vendor: String(po.vendor),
      po_number: po.po_number,
      order_date: po.order_date ? po.order_date.slice(0, 16) : "",
      expected_delivery_date: po.expected_delivery_date ? po.expected_delivery_date.slice(0, 16) : "",
      actual_delivery_date: po.actual_delivery_date ? po.actual_delivery_date.slice(0, 16) : "",
      quantity: String(po.quantity),
      status: po.status,
      quality_rating: po.quality_rating != null ? String(po.quality_rating) : "",
      issue_date: po.issue_date ? po.issue_date.slice(0, 16) : "",
      acknowledgment_date: po.acknowledgment_date ? po.acknowledgment_date.slice(0, 16) : "",
      items: itemsArray,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormMode("create");
    setSelectedId(null);
    setForm(emptyForm);
    setFieldErrors({});
  };

  // Validation functions
  const validateVendor = (value: string): string | null => {
    if (!value || value.trim() === "") {
      return "Vendor is required";
    }
    return null;
  };

  const validatePONumber = (value: string): string | null => {
    if (!value || value.trim() === "") {
      return "PO number is required";
    }
    if (value.length > 50) {
      return "PO number must be 50 characters or less";
    }
    return null;
  };

  const validateQuantity = (value: string): string | null => {
    if (!value || value.trim() === "") {
      return "Quantity is required";
    }
    const numValue = Number(value);
    if (isNaN(numValue)) {
      return "Quantity must be a valid number";
    }
    if (numValue < 0) {
      return "Quantity must be 0 or greater";
    }
    if (!Number.isInteger(numValue)) {
      return "Quantity must be a whole number";
    }
    return null;
  };

  const validateDate = (value: string, fieldName: string, required: boolean = false): string | null => {
    if (!value || value.trim() === "") {
      if (required) {
        return `${fieldName} is required`;
      }
      return null;
    }
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return `Please enter a valid ${fieldName.toLowerCase()}`;
    }
    return null;
  };

  const validateOrderDate = (value: string, mode: FormMode): string | null => {
    if (mode === "edit") {
      return validateDate(value, "Order date", true);
    }
    return null;
  };

  const validateIssueDate = (value: string, mode: FormMode): string | null => {
    if (mode === "edit") {
      return validateDate(value, "Issue date", true);
    }
    return null;
  };

  const validateExpectedDeliveryDate = (value: string, mode: FormMode, issueDate: string): string | null => {
    if (mode === "edit") {
      const dateError = validateDate(value, "Expected delivery date", true);
      if (dateError) return dateError;
      
      // Validate that expected delivery date is after issue date
      if (value && issueDate) {
        const expected = new Date(value);
        const issue = new Date(issueDate);
        if (expected <= issue) {
          return "Expected delivery date must be after issue date";
        }
      }
    }
    return null;
  };

  const validateActualDeliveryDate = (value: string, expectedDate?: string): string | null => {
    if (!value || value.trim() === "") {
      return null; // Optional field
    }
    const dateError = validateDate(value, "Actual delivery date", false);
    if (dateError) return dateError;
    
    // If expected date exists, validate that actual is not too far in the future compared to expected
    if (expectedDate && value) {
      const actual = new Date(value);
      const expected = new Date(expectedDate);
      const diffDays = (actual.getTime() - expected.getTime()) / (1000 * 60 * 60 * 24);
      if (diffDays > 365) {
        return "Actual delivery date seems too far in the future";
      }
    }
    return null;
  };

  const validateQualityRating = (value: string): string | null => {
    if (!value || value.trim() === "") {
      return null; // Optional field
    }
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      return "Quality rating must be a valid number";
    }
    if (numValue < 0 || numValue > 5) {
      return "Quality rating must be between 0 and 5";
    }
    return null;
  };

  const validateItems = (items: ItemPair[]): string | null => {
    const seenKeys = new Set<string>();
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      // If key is provided, value should also be provided
      if (item.key.trim() && !item.value.trim()) {
        return `Item ${i + 1}: Value is required when key is provided`;
      }
      // If value is provided, key should also be provided
      if (item.value.trim() && !item.key.trim()) {
        return `Item ${i + 1}: Key is required when value is provided`;
      }
      // Check for duplicate keys
      if (item.key.trim()) {
        const normalizedKey = item.key.trim().toLowerCase();
        if (seenKeys.has(normalizedKey)) {
          return `Item ${i + 1}: Duplicate key "${item.key.trim()}"`;
        }
        seenKeys.add(normalizedKey);
      }
    }
    return null;
  };

  // Validate a single field
  const validateField = (field: keyof PurchaseOrderForm, value: string | ItemPair[]): string | null => {
    switch (field) {
      case "vendor":
        return validateVendor(typeof value === 'string' ? value : '');
      case "po_number":
        return validatePONumber(typeof value === 'string' ? value : '');
      case "quantity":
        return validateQuantity(typeof value === 'string' ? value : '');
      case "order_date":
        return validateOrderDate(typeof value === 'string' ? value : '', formMode);
      case "issue_date":
        return validateIssueDate(typeof value === 'string' ? value : '', formMode);
      case "expected_delivery_date":
        return validateExpectedDeliveryDate(typeof value === 'string' ? value : '', formMode, form.issue_date);
      case "actual_delivery_date":
        return validateActualDeliveryDate(typeof value === 'string' ? value : '', form.expected_delivery_date);
      case "quality_rating":
        return validateQualityRating(typeof value === 'string' ? value : '');
      case "items":
        return validateItems(Array.isArray(value) ? value : []);
      default:
        return null;
    }
  };

  // Validate all fields
  const validateAllFields = (): boolean => {
    const errors: Record<string, string> = {};
    
    const vendorError = validateField("vendor", form.vendor);
    if (vendorError) errors.vendor = vendorError;

    const poNumberError = validateField("po_number", form.po_number);
    if (poNumberError) errors.po_number = poNumberError;

    const quantityError = validateField("quantity", form.quantity);
    if (quantityError) errors.quantity = quantityError;

    if (formMode === "edit") {
      const orderDateError = validateField("order_date", form.order_date);
      if (orderDateError) errors.order_date = orderDateError;

      const issueDateError = validateField("issue_date", form.issue_date);
      if (issueDateError) errors.issue_date = issueDateError;

      const expectedDeliveryError = validateField("expected_delivery_date", form.expected_delivery_date);
      if (expectedDeliveryError) errors.expected_delivery_date = expectedDeliveryError;
    }

    const actualDeliveryError = validateField("actual_delivery_date", form.actual_delivery_date);
    if (actualDeliveryError) errors.actual_delivery_date = actualDeliveryError;

    const qualityRatingError = validateField("quality_rating", form.quality_rating);
    if (qualityRatingError) errors.quality_rating = qualityRatingError;

    const itemsError = validateField("items", form.items);
    if (itemsError) errors.items = itemsError;

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFieldChange = (field: keyof PurchaseOrderForm, value: string | ItemPair[]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleFieldBlur = (field: keyof PurchaseOrderForm) => {
    const value = form[field];
    const error = validateField(field, value);
    if (error) {
      setFieldErrors((prev) => ({ ...prev, [field]: error }));
    } else {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
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
    // Clear items error when user starts typing
    if (fieldErrors.items) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.items;
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);
  
    // Validate all fields before submission
    if (!validateAllFields()) {
      setError("Please fix the errors in the form before submitting.");
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

    try {
      if (formMode === "create") {
        const createPayload: PurchaseOrderPayload = {
          po_number: form.po_number,
          vendor: Number(form.vendor),
          items: parsedItems,
          quantity: Number(form.quantity) || 0,
          order_date: nowIso,
          issue_date: nowIso,
          status: "pending" as POStatus,
          expected_delivery_date: nowIso, // Will be updated by vendor when acknowledging
          actual_delivery_date: null,
          quality_rating: null,
        };
        await createPurchaseOrder(createPayload);
        setSuccess("Purchase order created successfully.");
        const data = await listPurchaseOrders({ page: currentPage });
        setPurchaseOrders(data.results);
        setTotalPages(Math.ceil(data.count / 10));
      } else if (formMode === "edit" && selectedId != null) {
        const updatePayload: Partial<PurchaseOrderPayload> = {
          po_number: form.po_number,
          vendor: Number(form.vendor),
          items: parsedItems,
          quantity: Number(form.quantity) || 0,
          order_date: form.order_date
            ? new Date(form.order_date).toISOString()
            : nowIso,
          issue_date: form.issue_date
            ? new Date(form.issue_date).toISOString()
            : nowIso,
          status: form.status,
          expected_delivery_date: form.expected_delivery_date
            ? new Date(form.expected_delivery_date).toISOString()
            : undefined,
          actual_delivery_date: form.actual_delivery_date
            ? new Date(form.actual_delivery_date).toISOString()
            : null,
          quality_rating: form.quality_rating
            ? parseFloat(form.quality_rating)
            : null,
        };
        const updated = await updatePurchaseOrder(selectedId, updatePayload);
        setPurchaseOrders((prev) =>
          prev.map((po) => (po.id === updated.id ? updated : po)),
        );
        setSuccess("Purchase order updated successfully.");
      }
      resetForm();
      setIsDialogOpen(false);
    } catch (err: unknown) {
      console.error(err);
      
      // Handle field-specific errors from API
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: unknown } };
        const errorData = axiosError.response?.data;
        
        if (errorData && typeof errorData === 'object' && !('message' in errorData) && !('detail' in errorData)) {
          const errors: Record<string, string> = {};
          Object.keys(errorData).forEach((key) => {
            const errorValue = (errorData as Record<string, unknown>)[key];
            if (Array.isArray(errorValue)) {
              errors[key] = String(errorValue[0]);
            } else if (typeof errorValue === 'string') {
              errors[key] = errorValue;
            }
          });
          setFieldErrors(errors);
          setError("Please fix the errors in the form before submitting.");
        } else if (errorData && typeof errorData === 'object') {
          const message = 'message' in errorData ? String(errorData.message) : 
                         'detail' in errorData ? String(errorData.detail) : 
                         "Failed to save purchase order. Please check the data and try again.";
          setError(message);
        } else {
          setError("Failed to save purchase order. Please check the data and try again.");
        }
      } else {
        setError("Failed to save purchase order. Please check the data and try again.");
      }
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
      setSuccess("Purchase order deleted successfully.");
      // Refresh the current page
      const data = await listPurchaseOrders({ page: currentPage });
      setPurchaseOrders(data.results);
      setTotalPages(Math.ceil(data.count / 10));
      // If current page is empty and not page 1, go to previous page
      if (data.results.length === 0 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
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

  const handleRateQualityClick = (po: PurchaseOrder, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setPoToRate(po);
    setRatingValue(po.quality_rating != null ? String(po.quality_rating) : "");
    setIsRatingDialogOpen(true);
  };

  const handleUpdateRating = async () => {
    if (!poToRate) return;
    
    setRatingLoading(true);
    setError(null);
    try {
      const rating = ratingValue.trim() ? parseFloat(ratingValue) : null;
      if (rating !== null && (isNaN(rating) || rating < 0 || rating > 5)) {
        setError("Rating must be a number between 0 and 5");
        setRatingLoading(false);
        return;
      }
      
      const updated = await updatePurchaseOrder(poToRate.id, {
        quality_rating: rating,
      } as Partial<PurchaseOrderPayload>);
      
      setPurchaseOrders((prev) =>
        prev.map((po) => (po.id === updated.id ? updated : po))
      );
      setSuccess("Quality rating updated successfully!");
      setIsRatingDialogOpen(false);
      setPoToRate(null);
      setRatingValue("");
    } catch (err) {
      console.error(err);
      setError("Failed to update quality rating. Please try again.");
    } finally {
      setRatingLoading(false);
    }
  };

  const getStatusBadge = (status: POStatus) => {
    const variants = {
      pending: { variant: "warning" as const, label: "Pending" },
      acknowledged: { variant: "info" as const, label: "Acknowledged" },
      completed: { variant: "success" as const, label: "Completed" },
      canceled: { variant: "destructive" as const, label: "Canceled" },
    };
    const config = variants[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Purchase Orders</h1>
          <p className="text-muted-foreground mt-1">
            Track purchase orders and vendor performance inputs
          </p>
        </div>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          Add PO
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-2 hover:border-primary/50 transition-colors">
          <CardHeader className="py-4">
            <CardDescription className="text-xs font-medium uppercase tracking-wide">
              Total POs
            </CardDescription>
            <CardTitle className="text-3xl font-bold mt-2">{kpis.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-2 hover:border-primary/50 transition-colors">
          <CardHeader className="py-4">
            <CardDescription className="text-xs font-medium uppercase tracking-wide">
              Completed
            </CardDescription>
            <CardTitle className="text-3xl font-bold mt-2">{kpis.completed}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-2 hover:border-primary/50 transition-colors">
          <CardHeader className="py-4">
            <CardDescription className="text-xs font-medium uppercase tracking-wide">
              Pending
            </CardDescription>
            <CardTitle className="text-3xl font-bold mt-2">{kpis.pending}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-2 hover:border-primary/50 transition-colors">
          <CardHeader className="py-4">
            <CardDescription className="text-xs font-medium uppercase tracking-wide">
              Acknowledged
            </CardDescription>
            <CardTitle className="text-3xl font-bold mt-2">{kpis.acknowledged}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="border-2 overflow-hidden">
        <CardHeader className="border-b bg-muted/30">
          <CardTitle className="text-lg">Purchase Order Directory</CardTitle>
          <CardDescription>View and manage all purchase orders</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </div>
          ) : purchaseOrders.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <Plus className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">No purchase orders yet</p>
              <p className="text-xs text-muted-foreground mb-4">
                Get started by creating your first purchase order
              </p>
              <Button size="sm" onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Add Purchase Order
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b">
                  <tr className="text-left">
                    <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wide">PO #</th>
                    <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wide">Vendor</th>
                    <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wide hidden md:table-cell">
                      Status
                    </th>
                    <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wide hidden md:table-cell">
                      Expected Delivery
                    </th>
                    <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wide hidden lg:table-cell">
                      Acknowledged
                    </th>
                    <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wide hidden lg:table-cell">
                      Quantity
                    </th>
                    <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wide hidden lg:table-cell">
                      Quality
                    </th>
                    <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wide text-right">
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
                        className="border-b last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                        onClick={() => openEditDialog(po)}
                      >
                        <td className="px-6 py-4">
                          <div className="font-semibold font-mono">{po.po_number}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium">
                            {vendor ? vendor.name : `Vendor #${po.vendor}`}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {vendor?.vendor_code}
                          </div>
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell">
                          {getStatusBadge(po.status)}
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell">
                          <div className="text-sm">
                            {new Date(po.expected_delivery_date).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(po.expected_delivery_date).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4 hidden lg:table-cell">
                          {po.acknowledgment_date ? (
                            <>
                              <div className="text-sm">
                                {new Date(po.acknowledgment_date).toLocaleDateString()}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(po.acknowledgment_date).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                            </>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 hidden lg:table-cell">
                          <span className="font-medium">{po.quantity}</span>
                        </td>
                        <td className="px-6 py-4 hidden lg:table-cell">
                          {po.quality_rating != null ? (
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{po.quality_rating.toFixed(2)}</span>
                              <span className="text-xs text-muted-foreground">/ 5.0</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(po)}
                              className="gap-1"
                            >
                              <Edit className="h-3.5 w-3.5" />
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1"
                              onClick={(e) => handleDeleteClick(po, e)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={
                                (po.status !== "pending" && po.status !== "acknowledged") ||
                                ackLoadingId === po.id
                              }
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAcknowledge(po);
                              }}
                              className="gap-1"
                            >
                              {ackLoadingId === po.id ? (
                                <>Loading...</>
                              ) : po.status === "acknowledged" ? (
                                <>
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  Re-ack
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  Acknowledge
                                </>
                              )}
                            </Button>
                            {po.status === "completed" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => handleRateQualityClick(po, e)}
                                className="gap-1"
                              >
                                <Star className="h-3.5 w-3.5" />
                                Rate
                              </Button>
                            )}
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
            <div className="px-6 py-4 text-sm text-destructive border-t bg-destructive/10">
              {error}
            </div>
          )}
        </CardContent>
        {!loading && purchaseOrders.length > 0 && (
          <div className="border-t px-6 py-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        )}
      </Card>

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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="vendor">Vendor</Label>
                <select
                  id="vendor"
                  className={`flex h-9 w-full rounded-md border ${
                    fieldErrors.vendor ? "border-destructive" : "border-input"
                  } bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50`}
                  value={form.vendor}
                  onChange={(e) => handleFieldChange("vendor", e.target.value)}
                  onBlur={() => handleFieldBlur("vendor")}
                  required
                >
                  <option value="">Select vendor</option>
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.vendor_code})
                    </option>
                  ))}
                </select>
                {fieldErrors.vendor && (
                  <p className="text-xs text-destructive">{fieldErrors.vendor}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="po_number">PO number</Label>
                <Input
                  id="po_number"
                  value={form.po_number}
                  onChange={(e) => handleFieldChange("po_number", e.target.value)}
                  onBlur={() => handleFieldBlur("po_number")}
                  className={fieldErrors.po_number ? "border-destructive" : ""}
                  required
                />
                {fieldErrors.po_number && (
                  <p className="text-xs text-destructive">{fieldErrors.po_number}</p>
                )}
              </div>
            </div>

            {/* Show order_date and issue_date only in edit mode */}
            {formMode === "edit" && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="order_date">Order date</Label>
                  <Input
                    id="order_date"
                    type="datetime-local"
                    value={form.order_date}
                    onChange={(e) => handleFieldChange("order_date", e.target.value)}
                    onBlur={() => handleFieldBlur("order_date")}
                    className={fieldErrors.order_date ? "border-destructive" : ""}
                    required
                  />
                  {fieldErrors.order_date && (
                    <p className="text-xs text-destructive">{fieldErrors.order_date}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="issue_date">Issue date</Label>
                  <Input
                    id="issue_date"
                    type="datetime-local"
                    value={form.issue_date}
                    onChange={(e) => handleFieldChange("issue_date", e.target.value)}
                    onBlur={() => handleFieldBlur("issue_date")}
                    className={fieldErrors.issue_date ? "border-destructive" : ""}
                    required
                  />
                  {fieldErrors.issue_date && (
                    <p className="text-xs text-destructive">{fieldErrors.issue_date}</p>
                  )}
                </div>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              {/* Show expected_delivery_date only in edit mode */}
              {formMode === "edit" && (
                <div className="space-y-2">
                  <Label htmlFor="expected_delivery_date">Expected delivery</Label>
                  <Input
                    id="expected_delivery_date"
                    type="datetime-local"
                    value={form.expected_delivery_date}
                    onChange={(e) =>
                      handleFieldChange("expected_delivery_date", e.target.value)
                    }
                    onBlur={() => handleFieldBlur("expected_delivery_date")}
                    className={fieldErrors.expected_delivery_date ? "border-destructive" : ""}
                    required
                  />
                  {fieldErrors.expected_delivery_date && (
                    <p className="text-xs text-destructive">{fieldErrors.expected_delivery_date}</p>
                  )}
                </div>
              )}
              {/* Show actual_delivery_date only in edit mode */}
              {formMode === "edit" && (
                <div className="space-y-2">
                  <Label htmlFor="actual_delivery_date">
                    Actual delivery date (optional)
                  </Label>
                  <Input
                    id="actual_delivery_date"
                    type="datetime-local"
                    value={form.actual_delivery_date}
                    onChange={(e) =>
                      handleFieldChange("actual_delivery_date", e.target.value)
                    }
                    onBlur={() => handleFieldBlur("actual_delivery_date")}
                    className={fieldErrors.actual_delivery_date ? "border-destructive" : ""}
                  />
                  {fieldErrors.actual_delivery_date && (
                    <p className="text-xs text-destructive">{fieldErrors.actual_delivery_date}</p>
                  )}
                </div>
              )}
              {/* Show acknowledgment_date only in edit mode and if it exists (read-only) */}
              {formMode === "edit" && form.acknowledgment_date && (
                <div className="space-y-2">
                  <Label htmlFor="acknowledgment_date">
                    Acknowledgment date (read-only)
                  </Label>
                  <Input
                    id="acknowledgment_date"
                    type="datetime-local"
                    value={form.acknowledgment_date}
                    disabled
                    className="bg-muted cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground">
                    This date is set automatically when the vendor acknowledges the order
                  </p>
                </div>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min={0}
                  value={form.quantity}
                  onChange={(e) => handleFieldChange("quantity", e.target.value)}
                  onBlur={() => handleFieldBlur("quantity")}
                  className={fieldErrors.quantity ? "border-destructive" : ""}
                  required
                />
                {fieldErrors.quantity && (
                  <p className="text-xs text-destructive">{fieldErrors.quantity}</p>
                )}
              </div>
            </div>

            {/* Show status only in edit mode */}
            {formMode === "edit" && (
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
            )}


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
                <div className={`space-y-2 rounded-md border p-3 ${
                  fieldErrors.items ? "border-destructive" : "border-input"
                }`}>
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
              {fieldErrors.items && (
                <p className="text-xs text-destructive">{fieldErrors.items}</p>
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

      {success && <Toast message={success} type="success" onClose={() => setSuccess(null)} />}

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

      {/* Rating Dialog */}
      <Dialog open={isRatingDialogOpen} onOpenChange={setIsRatingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rate Quality</DialogTitle>
            <DialogDescription>
              Set the quality rating for{" "}
              <span className="font-medium">
                {poToRate?.po_number ?? "this purchase order"}
              </span>
            </DialogDescription>
          </DialogHeader>
          {poToRate && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="quality_rating">
                  Quality Rating (0-5)
                </Label>
                <Input
                  id="quality_rating"
                  type="number"
                  step="0.1"
                  min={0}
                  max={5}
                  value={ratingValue}
                  onChange={(e) => setRatingValue(e.target.value)}
                  placeholder="Enter rating (e.g., 4.5)"
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty to remove the rating
                </p>
              </div>
              {error && (
                <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3">
                  <p className="text-sm text-destructive font-medium">{error}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setIsRatingDialogOpen(false);
                setPoToRate(null);
                setRatingValue("");
                setError(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleUpdateRating}
              disabled={ratingLoading}
            >
              {ratingLoading ? "Updating..." : "Update Rating"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}