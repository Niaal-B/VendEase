import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  listVendors,
  createVendor,
  updateVendor,
  deleteVendor,
  type Vendor,
  type VendorPayload,
} from "@/api/vendors";
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
import { Plus, Edit, Trash2, TrendingUp, TrendingDown } from "lucide-react";

type FormMode = "create" | "edit";

const emptyForm: VendorPayload = {
  name: "",
  contact_details: "",
  address: "",
  vendor_code: "",
};

export function VendorsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const pageParam = searchParams.get("page");
  const initialPage = pageParam ? parseInt(pageParam, 10) : 1;
  
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);

  const [formMode, setFormMode] = useState<FormMode>("create");
  const [selectedVendorId, setSelectedVendorId] = useState<number | null>(null);
  const [form, setForm] = useState<VendorPayload>(emptyForm);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [vendorToDelete, setVendorToDelete] = useState<Vendor | null>(null);

  // Sync currentPage with URL when URL changes
  useEffect(() => {
    const page = pageParam ? parseInt(pageParam, 10) : 1;
    if (page >= 1 && !isNaN(page) && page !== currentPage) {
      setCurrentPage(page);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageParam]); // Only depend on pageParam to avoid loops when currentPage changes

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setSuccess(null);
      try {
        const data = await listVendors({ page: currentPage });
        setVendors(data.results);
        // Calculate total pages from count (assuming 10 items per page)
        setTotalPages(Math.ceil(data.count / 10));
      } catch (err) {
        console.error(err);
        setError("Failed to load vendors. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSearchParams({ page: page.toString() });
  };

  useEffect(() => {
    if (!success) return;
    const id = setTimeout(() => setSuccess(null), 3000);
    return () => clearTimeout(id);
  }, [success]);

  const handleSelectVendor = (vendor: Vendor) => {
    setFormMode("edit");
    setSelectedVendorId(vendor.id);
    setForm({
      name: vendor.name,
      contact_details: vendor.contact_details,
      address: vendor.address,
      vendor_code: vendor.vendor_code,
    });
    setIsDialogOpen(true);
  };

  const handleResetForm = () => {
    setFormMode("create");
    setSelectedVendorId(null);
    setForm(emptyForm);
  };

  const handleChange = (field: keyof VendorPayload, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      if (formMode === "create") {
        await createVendor(form);
        setSuccess("Vendor created successfully.");
        // Refresh the current page to show the new vendor
        const data = await listVendors({ page: currentPage });
        setVendors(data.results);
        setTotalPages(Math.ceil(data.count / 10));
      } else if (formMode === "edit" && selectedVendorId != null) {
        const updated = await updateVendor(selectedVendorId, form);
        setVendors((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
        setSuccess("Vendor updated successfully.");
      }
      handleResetForm();
      setIsDialogOpen(false);
    } catch (err) {
      console.error(err);
      setError("Failed to save vendor. Please check the data and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (vendor: Vendor, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setVendorToDelete(vendor);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!vendorToDelete) return;
    try {
      setError(null);
      setSuccess(null);
      await deleteVendor(vendorToDelete.id);
      if (selectedVendorId === vendorToDelete.id) {
        handleResetForm();
      }
      setSuccess("Vendor deleted successfully.");
      // Refresh the current page
      const data = await listVendors({ page: currentPage });
      setVendors(data.results);
      setTotalPages(Math.ceil(data.count / 10));
      // If current page is empty and not page 1, go to previous page
      if (data.results.length === 0 && currentPage > 1) {
        handlePageChange(currentPage - 1);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to delete vendor. Please try again.");
    } finally {
      setIsDeleteDialogOpen(false);
      setVendorToDelete(null);
    }
  };

  const kpis = useMemo(() => {
    if (!vendors.length) {
      return {
        avgOnTime: 0,
        avgQuality: 0,
        avgResponse: 0,
        avgFulfillment: 0,
      };
    }
    const sum = vendors.reduce(
      (acc, v) => {
        acc.onTime += v.on_time_delivery_rate;
        acc.quality += v.quality_rating_avg;
        acc.response += v.average_response_time;
        acc.fulfillment += v.fulfillment_rate;
        return acc;
      },
      { onTime: 0, quality: 0, response: 0, fulfillment: 0 }
    );
    const count = vendors.length;
    return {
      avgOnTime: sum.onTime / count,
      avgQuality: sum.quality / count,
      avgResponse: sum.response / count,
      avgFulfillment: sum.fulfillment / count,
    };
  }, [vendors]);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vendors</h1>
          <p className="text-muted-foreground mt-1">
            Manage vendor directory and performance overview
          </p>
        </div>
        <Button
          onClick={() => {
            handleResetForm();
            setIsDialogOpen(true);
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Vendor
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="border-2 hover:border-primary/50 transition-colors">
          <CardHeader className="py-4">
            <CardDescription className="text-xs font-medium uppercase tracking-wide">
              Total Vendors
            </CardDescription>
            <CardTitle className="text-3xl font-bold mt-2">{vendors.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-2 hover:border-primary/50 transition-colors">
          <CardHeader className="py-4">
            <CardDescription className="text-xs font-medium uppercase tracking-wide">
              Avg. On-time Delivery
            </CardDescription>
            <CardTitle className="text-3xl font-bold mt-2">
              {kpis.avgOnTime.toFixed(1)}
              <span className="text-lg font-normal text-muted-foreground ml-1">%</span>
            </CardTitle>
            {kpis.avgOnTime >= 80 ? (
              <TrendingUp className="h-4 w-4 text-emerald-600 mt-2" />
            ) : (
              <TrendingDown className="h-4 w-4 text-destructive mt-2" />
            )}
          </CardHeader>
        </Card>
        <Card className="border-2 hover:border-primary/50 transition-colors">
          <CardHeader className="py-4">
            <CardDescription className="text-xs font-medium uppercase tracking-wide">
              Avg. Quality Rating
            </CardDescription>
            <CardTitle className="text-3xl font-bold mt-2">
              {kpis.avgQuality.toFixed(2)}
              <span className="text-lg font-normal text-muted-foreground ml-1">/ 5</span>
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-2 hover:border-primary/50 transition-colors">
          <CardHeader className="py-4">
            <CardDescription className="text-xs font-medium uppercase tracking-wide">
              Avg. Response Time
            </CardDescription>
            <CardTitle className="text-3xl font-bold mt-2">
              {kpis.avgResponse.toFixed(1)}
              <span className="text-lg font-normal text-muted-foreground ml-1">hrs</span>
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-2 hover:border-primary/50 transition-colors">
          <CardHeader className="py-4">
            <CardDescription className="text-xs font-medium uppercase tracking-wide">
              Avg. Fulfillment Rate
            </CardDescription>
            <CardTitle className="text-3xl font-bold mt-2">
              {kpis.avgFulfillment.toFixed(1)}
              <span className="text-lg font-normal text-muted-foreground ml-1">%</span>
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="border-2 overflow-hidden">
        <CardHeader className="border-b bg-muted/30">
          <CardTitle className="text-lg">Vendor Directory</CardTitle>
          <CardDescription>View and manage all registered vendors</CardDescription>
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
          ) : vendors.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <Plus className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">No vendors yet</p>
              <p className="text-xs text-muted-foreground mb-4">
                Get started by adding your first vendor
              </p>
              <Button
                size="sm"
                onClick={() => {
                  handleResetForm();
                  setIsDialogOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Vendor
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b">
                  <tr className="text-left">
                    <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wide">Name</th>
                    <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wide">Code</th>
                    <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wide hidden md:table-cell">On-time %</th>
                    <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wide hidden md:table-cell">Quality</th>
                    <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wide hidden md:table-cell">Response Time</th>
                    <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wide hidden lg:table-cell">Fulfillment %</th>
                    <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wide text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vendors.map((vendor) => (
                    <tr
                      key={vendor.id}
                      className={`border-b last:border-0 hover:bg-muted/30 transition-colors cursor-pointer ${
                        selectedVendorId === vendor.id ? "bg-primary/5" : ""
                      }`}
                      onClick={() => handleSelectVendor(vendor)}
                    >
                      <td className="px-6 py-4">
                        <div className="font-semibold">{vendor.name}</div>
                        <div className="text-xs text-muted-foreground truncate max-w-xs mt-0.5">
                          {vendor.address}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="font-mono text-xs">
                          {vendor.vendor_code}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{vendor.on_time_delivery_rate.toFixed(1)}%</span>
                          {vendor.on_time_delivery_rate >= 80 ? (
                            <Badge variant="success" className="text-xs">Good</Badge>
                          ) : vendor.on_time_delivery_rate >= 50 ? (
                            <Badge variant="warning" className="text-xs">Fair</Badge>
                          ) : (
                            <Badge variant="destructive" className="text-xs">Poor</Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{vendor.quality_rating_avg.toFixed(2)}</span>
                          <span className="text-xs text-muted-foreground">/ 5.0</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <span className="font-medium">{vendor.average_response_time.toFixed(1)}</span>
                        <span className="text-xs text-muted-foreground ml-1">hrs</span>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <span className="font-medium">{vendor.fulfillment_rate.toFixed(1)}%</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSelectVendor(vendor)}
                            className="gap-1"
                          >
                            <Edit className="h-3.5 w-3.5" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1"
                            onClick={(e) => handleDeleteClick(vendor, e)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
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
        {!loading && vendors.length > 0 && (
          <div className="border-t px-6 py-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{formMode === "create" ? "Add vendor" : "Edit vendor"}</DialogTitle>
            <DialogDescription>
              {formMode === "create"
                ? "Provide vendor details to register a new vendor."
                : "Update vendor details and save your changes."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vendor_code">Vendor code</Label>
              <Input
                id="vendor_code"
                value={form.vendor_code}
                onChange={(e) => handleChange("vendor_code", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_details">Contact details</Label>
              <Input
                id="contact_details"
                value={form.contact_details}
                onChange={(e) => handleChange("contact_details", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={form.address}
                onChange={(e) => handleChange("address", e.target.value)}
                required
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  handleResetForm();
                  setIsDialogOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : formMode === "create" ? "Create vendor" : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {success && <Toast message={success} type="success" onClose={() => setSuccess(null)} />}

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete vendor</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-medium">{vendorToDelete?.name ?? "this vendor"}</span>? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setVendorToDelete(null);
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


