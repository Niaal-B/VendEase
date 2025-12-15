import { useEffect, useMemo, useState } from "react";
import { listVendors, createVendor, updateVendor, deleteVendor, type Vendor, type VendorPayload } from "@/api/vendors";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type FormMode = "create" | "edit";

const emptyForm: VendorPayload = {
  name: "",
  contact_details: "",
  address: "",
  vendor_code: "",
};

export function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formMode, setFormMode] = useState<FormMode>("create");
  const [selectedVendorId, setSelectedVendorId] = useState<number | null>(null);
  const [form, setForm] = useState<VendorPayload>(emptyForm);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await listVendors();
        setVendors(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load vendors. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSelectVendor = (vendor: Vendor) => {
    setFormMode("edit");
    setSelectedVendorId(vendor.id);
    setForm({
      name: vendor.name,
      contact_details: vendor.contact_details,
      address: vendor.address,
      vendor_code: vendor.vendor_code,
    });
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
    try {
      if (formMode === "create") {
        const created = await createVendor(form);
        setVendors((prev) => [created, ...prev]);
        handleResetForm();
      } else if (formMode === "edit" && selectedVendorId != null) {
        const updated = await updateVendor(selectedVendorId, form);
        setVendors((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
      }
    } catch (err) {
      console.error(err);
      setError("Failed to save vendor. Please check the data and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (vendor: Vendor) => {
    if (!window.confirm(`Delete vendor "${vendor.name}"?`)) return;
    try {
      await deleteVendor(vendor.id);
      setVendors((prev) => prev.filter((v) => v.id !== vendor.id));
      if (selectedVendorId === vendor.id) {
        handleResetForm();
      }
    } catch (err) {
      console.error(err);
      setError("Failed to delete vendor. Please try again.");
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
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="py-3">
            <CardDescription>Total Vendors</CardDescription>
            <CardTitle className="text-2xl">{vendors.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="py-3">
            <CardDescription>Avg. On-time Delivery</CardDescription>
            <CardTitle className="text-2xl">
              {kpis.avgOnTime.toFixed(1)}
              <span className="text-sm font-normal text-muted-foreground ml-1">%</span>
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="py-3">
            <CardDescription>Avg. Quality Rating</CardDescription>
            <CardTitle className="text-2xl">
              {kpis.avgQuality.toFixed(2)}
              <span className="text-sm font-normal text-muted-foreground ml-1">/ 5</span>
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="py-3">
            <CardDescription>Avg. Fulfillment Rate</CardDescription>
            <CardTitle className="text-2xl">
              {kpis.avgFulfillment.toFixed(1)}
              <span className="text-sm font-normal text-muted-foreground ml-1">%</span>
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Vendors</CardTitle>
              <CardDescription>Manage vendor directory and performance overview.</CardDescription>
            </div>
            <Button size="sm" onClick={handleResetForm}>
              + Add vendor
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="py-10 text-center text-sm text-muted-foreground">Loading vendors...</div>
            ) : vendors.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">No vendors yet. Use “Add vendor” to create one.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40 border-b">
                    <tr className="text-left">
                      <th className="px-4 py-2 font-medium">Name</th>
                      <th className="px-4 py-2 font-medium">Code</th>
                      <th className="px-4 py-2 font-medium hidden md:table-cell">On-time %</th>
                      <th className="px-4 py-2 font-medium hidden md:table-cell">Quality</th>
                      <th className="px-4 py-2 font-medium hidden lg:table-cell">Fulfillment %</th>
                      <th className="px-4 py-2 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendors.map((vendor) => (
                      <tr
                        key={vendor.id}
                        className={`border-b last:border-0 hover:bg-muted/40 cursor-pointer ${
                          selectedVendorId === vendor.id ? "bg-muted/60" : ""
                        }`}
                        onClick={() => handleSelectVendor(vendor)}
                      >
                        <td className="px-4 py-2">
                          <div className="font-medium">{vendor.name}</div>
                          <div className="text-xs text-muted-foreground truncate max-w-xs">{vendor.address}</div>
                        </td>
                        <td className="px-4 py-2 text-xs md:text-sm">{vendor.vendor_code}</td>
                        <td className="px-4 py-2 hidden md:table-cell">
                          {vendor.on_time_delivery_rate.toFixed(1)}%
                        </td>
                        <td className="px-4 py-2 hidden md:table-cell">
                          {vendor.quality_rating_avg.toFixed(2)}
                        </td>
                        <td className="px-4 py-2 hidden lg:table-cell">
                          {vendor.fulfillment_rate.toFixed(1)}%
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectVendor(vendor);
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(vendor);
                              }}
                            >
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
              <div className="px-4 py-3 text-sm text-destructive border-t bg-destructive/10">{error}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{formMode === "create" ? "Add vendor" : "Edit vendor"}</CardTitle>
            <CardDescription>
              {formMode === "create"
                ? "Provide vendor details to register a new vendor."
                : "Update vendor details and save your changes."}
            </CardDescription>
          </CardHeader>
          <CardContent>
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
              <div className="flex justify-end gap-2 pt-2">
                {formMode === "edit" && (
                  <Button type="button" variant="ghost" onClick={handleResetForm}>
                    Cancel
                  </Button>
                )}
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Saving..." : formMode === "create" ? "Create vendor" : "Save changes"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


