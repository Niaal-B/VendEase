import type { FormEvent } from "react";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerVendor, type VendorRegistrationPayload } from "@/api/vendors";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/ui/logo";

export function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<VendorRegistrationPayload>({
    username: "",
    email: "",
    password: "",
    password_confirm: "",
    name: "",
    contact_details: "",
    address: "",
    vendor_code: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof VendorRegistrationPayload) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    // Clear general error
    if (error) setError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setLoading(true);

    // Client-side validation
    if (formData.password !== formData.password_confirm) {
      setFieldErrors({ password_confirm: "Passwords do not match" });
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setFieldErrors({ password: "Password must be at least 8 characters" });
      setLoading(false);
      return;
    }

    try {
      const response = await registerVendor(formData);
      
      // Store tokens
      localStorage.setItem(ACCESS_TOKEN_KEY, response.access);
      if (response.refresh) {
        localStorage.setItem(REFRESH_TOKEN_KEY, response.refresh);
      }
      
      // Redirect to vendor dashboard
      navigate("/vendor/dashboard");
    } catch (err: any) {
      console.error(err);
      
      // Handle field-specific errors
      if (err.response?.data) {
        const errorData = err.response.data;
        
        // Check if it's a field error object
        if (typeof errorData === 'object' && !errorData.message) {
          const errors: Record<string, string> = {};
          Object.keys(errorData).forEach((key) => {
            const errorValue = errorData[key];
            if (Array.isArray(errorValue)) {
              errors[key] = errorValue[0];
            } else if (typeof errorValue === 'string') {
              errors[key] = errorValue;
            }
          });
          setFieldErrors(errors);
        } else {
          setError(errorData.message || errorData.detail || "Registration failed. Please try again.");
        }
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-background to-muted/20 py-8">
      <Card className="w-full max-w-2xl border-2 shadow-xl">
        <CardHeader className="text-center space-y-4 pb-6">
          <div className="flex justify-center">
            <Logo />
          </div>
          <div>
            <CardTitle className="text-2xl">Create Vendor Account</CardTitle>
            <CardDescription className="mt-2">
              Register as a vendor to access your portal
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium">
                  Username <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={handleChange("username")}
                  autoComplete="username"
                  required
                  className="h-11"
                  placeholder="Choose a username"
                  disabled={loading}
                />
                {fieldErrors.username && (
                  <p className="text-sm text-destructive">{fieldErrors.username}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange("email")}
                  autoComplete="email"
                  required
                  className="h-11"
                  placeholder="your@email.com"
                  disabled={loading}
                />
                {fieldErrors.email && (
                  <p className="text-sm text-destructive">{fieldErrors.email}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange("password")}
                  autoComplete="new-password"
                  required
                  className="h-11"
                  placeholder="At least 8 characters"
                  disabled={loading}
                />
                {fieldErrors.password && (
                  <p className="text-sm text-destructive">{fieldErrors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="password_confirm" className="text-sm font-medium">
                  Confirm Password <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="password_confirm"
                  type="password"
                  value={formData.password_confirm}
                  onChange={handleChange("password_confirm")}
                  autoComplete="new-password"
                  required
                  className="h-11"
                  placeholder="Confirm your password"
                  disabled={loading}
                />
                {fieldErrors.password_confirm && (
                  <p className="text-sm text-destructive">{fieldErrors.password_confirm}</p>
                )}
              </div>

              {/* Vendor Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Vendor Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={handleChange("name")}
                  required
                  className="h-11"
                  placeholder="Your company name"
                  disabled={loading}
                />
                {fieldErrors.name && (
                  <p className="text-sm text-destructive">{fieldErrors.name}</p>
                )}
              </div>

              {/* Vendor Code */}
              <div className="space-y-2">
                <Label htmlFor="vendor_code" className="text-sm font-medium">
                  Vendor Code <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="vendor_code"
                  value={formData.vendor_code}
                  onChange={handleChange("vendor_code")}
                  required
                  className="h-11"
                  placeholder="VENDOR001"
                  disabled={loading}
                />
                {fieldErrors.vendor_code && (
                  <p className="text-sm text-destructive">{fieldErrors.vendor_code}</p>
                )}
              </div>
            </div>

            {/* Contact Details */}
            <div className="space-y-2">
              <Label htmlFor="contact_details" className="text-sm font-medium">
                Contact Details <span className="text-destructive">*</span>
              </Label>
              <Input
                id="contact_details"
                value={formData.contact_details}
                onChange={handleChange("contact_details")}
                required
                className="h-11"
                placeholder="Phone, email, or other contact information"
                disabled={loading}
              />
              {fieldErrors.contact_details && (
                <p className="text-sm text-destructive">{fieldErrors.contact_details}</p>
              )}
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address" className="text-sm font-medium">
                Address <span className="text-destructive">*</span>
              </Label>
              <textarea
                id="address"
                value={formData.address}
                onChange={handleChange("address")}
                required
                rows={3}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Your business address"
                disabled={loading}
              />
              {fieldErrors.address && (
                <p className="text-sm text-destructive">{fieldErrors.address}</p>
              )}
            </div>

            {error && (
              <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3">
                <p className="text-sm text-destructive font-medium">{error}</p>
              </div>
            )}

            <Button type="submit" className="w-full h-11 text-base" disabled={loading}>
              {loading ? "Creating account..." : "Create Vendor Account"}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

