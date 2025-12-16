import { useEffect, useState } from "react";
import { listVendors } from "@/api/vendors";
import { listPurchaseOrders } from "@/api/purchaseOrders";
import type { Vendor } from "@/api/vendors";
import type { PurchaseOrder } from "@/api/purchaseOrders";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Package,
  Users,
  TrendingUp,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export function DashboardPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // For dashboard, we want all data, so we'll fetch multiple pages if needed
        const [vsData, posData] = await Promise.all([
          listVendors({ page: 1 }),
          listPurchaseOrders({ page: 1 }),
        ]);
        setVendors(vsData.results);
        setPurchaseOrders(posData.results);
        // If there are more pages, fetch them (for dashboard we want all data)
        if (vsData.count > 10) {
          const allVendors = [...vsData.results];
          for (let page = 2; page <= Math.ceil(vsData.count / 10); page++) {
            const pageData = await listVendors({ page });
            allVendors.push(...pageData.results);
          }
          setVendors(allVendors);
        }
        if (posData.count > 10) {
          const allPOs = [...posData.results];
          for (let page = 2; page <= Math.ceil(posData.count / 10); page++) {
            const pageData = await listPurchaseOrders({ page });
            allPOs.push(...pageData.results);
          }
          setPurchaseOrders(allPOs);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Calculate metrics
  const stats = {
    totalVendors: vendors.length,
    totalPOs: purchaseOrders.length,
    completedPOs: purchaseOrders.filter((po) => po.status === "completed").length,
    pendingPOs: purchaseOrders.filter((po) => po.status === "pending").length,
    avgOnTimeDelivery: vendors.length
      ? vendors.reduce((sum, v) => sum + v.on_time_delivery_rate, 0) / vendors.length
      : 0,
    avgQualityRating: vendors.length
      ? vendors.reduce((sum, v) => sum + v.quality_rating_avg, 0) / vendors.length
      : 0,
  };

  // Vendor performance data for bar chart
  const vendorPerformance = vendors
    .map((v) => ({
      name: v.name.length > 15 ? v.name.substring(0, 15) + "..." : v.name,
      "On-time %": v.on_time_delivery_rate,
      "Quality": v.quality_rating_avg * 20, // Scale to 0-100 for comparison
      "Fulfillment %": v.fulfillment_rate,
    }))
    .slice(0, 5); // Top 5 vendors

  // PO status distribution for pie chart
  const poStatusData = [
    { name: "Completed", value: purchaseOrders.filter((po) => po.status === "completed").length },
    { name: "Pending", value: purchaseOrders.filter((po) => po.status === "pending").length },
    { name: "Acknowledged", value: purchaseOrders.filter((po) => po.status === "acknowledged").length },
    { name: "Canceled", value: purchaseOrders.filter((po) => po.status === "canceled").length },
  ].filter((item) => item.value > 0);

  // Response time by vendor
  const responseTimeData = vendors
    .filter((v) => v.average_response_time > 0)
    .map((v) => ({
      name: v.name.length > 12 ? v.name.substring(0, 12) + "..." : v.name,
      "Response Time (hrs)": v.average_response_time,
    }))
    .slice(0, 6);

  // Quality rating trend
  const qualityData = vendors
    .filter((v) => v.quality_rating_avg > 0)
    .map((v) => ({
      name: v.name.length > 10 ? v.name.substring(0, 10) + "..." : v.name,
      "Quality Rating": v.quality_rating_avg,
    }))
    .sort((a, b) => b["Quality Rating"] - a["Quality Rating"])
    .slice(0, 5);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16 mt-2" />
              </CardHeader>
            </Card>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of your vendor management system
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-2 hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Vendors
            </CardTitle>
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalVendors}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3 text-emerald-600" />
              Active vendors
            </p>
          </CardContent>
        </Card>
        <Card className="border-2 hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total POs
            </CardTitle>
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalPOs}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.completedPOs} completed, {stats.pendingPOs} pending
            </p>
          </CardContent>
        </Card>
        <Card className="border-2 hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg. On-time Delivery
            </CardTitle>
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.avgOnTimeDelivery.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              {stats.avgOnTimeDelivery >= 80 ? (
                <ArrowUpRight className="h-3 w-3 text-emerald-600" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-destructive" />
              )}
              Across all vendors
            </p>
          </CardContent>
        </Card>
        <Card className="border-2 hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg. Quality Rating
            </CardTitle>
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.avgQualityRating.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Out of 5.0</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Vendor Performance Bar Chart */}
        <Card className="border-2">
          <CardHeader className="border-b">
            <CardTitle className="text-lg">Top Vendor Performance</CardTitle>
            <CardDescription>Performance metrics comparison across top vendors</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {vendorPerformance.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={vendorPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                  <XAxis 
                    dataKey="name" 
                    angle={0} 
                    textAnchor="middle" 
                    height={60}
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    interval={0}
                  />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                  />
                  <Legend />
                  <Bar dataKey="On-time %" fill="#0088FE" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Quality" fill="#00C49F" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Fulfillment %" fill="#FFBB28" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-80 flex items-center justify-center text-muted-foreground">
                No vendor data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* PO Status Pie Chart */}
        <Card className="border-2">
          <CardHeader className="border-b">
            <CardTitle className="text-lg">Purchase Order Status</CardTitle>
            <CardDescription>Distribution of PO statuses across all orders</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {poStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={poStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {poStatusData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-80 flex items-center justify-center text-muted-foreground">
                No purchase order data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Response Time Chart */}
        <Card className="border-2">
          <CardHeader className="border-b">
            <CardTitle className="text-lg">Average Response Time</CardTitle>
            <CardDescription>Vendor response time in hours</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {responseTimeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={responseTimeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                  <XAxis 
                    dataKey="name" 
                    angle={0} 
                    textAnchor="middle" 
                    height={60}
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    interval={0}
                  />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                  />
                  <Bar dataKey="Response Time (hrs)" fill="#8884d8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-80 flex items-center justify-center text-muted-foreground">
                No response time data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quality Rating Line Chart */}
        <Card className="border-2">
          <CardHeader className="border-b">
            <CardTitle className="text-lg">Quality Rating Trend</CardTitle>
            <CardDescription>Top vendors by quality rating</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {qualityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={qualityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                  <XAxis 
                    dataKey="name" 
                    angle={0} 
                    textAnchor="middle" 
                    height={60}
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    interval={0}
                  />
                  <YAxis domain={[0, 5]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="Quality Rating"
                    stroke="#00C49F"
                    strokeWidth={3}
                    dot={{ r: 5, fill: "#00C49F" }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-80 flex items-center justify-center text-muted-foreground">
                No quality rating data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

