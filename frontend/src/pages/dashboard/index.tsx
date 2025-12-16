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
} from "lucide-react";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export function DashboardPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vs, pos] = await Promise.all([
          listVendors(),
          listPurchaseOrders(),
        ]);
        setVendors(vs);
        setPurchaseOrders(pos);
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
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVendors}</div>
            <p className="text-xs text-muted-foreground">Active vendors</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total POs</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPOs}</div>
            <p className="text-xs text-muted-foreground">
              {stats.completedPOs} completed, {stats.pendingPOs} pending
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. On-time Delivery</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgOnTimeDelivery.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Across all vendors</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Quality Rating</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgQualityRating.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Out of 5.0</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Vendor Performance Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Top Vendor Performance</CardTitle>
            <CardDescription>Performance metrics comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={vendorPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={0} 
                  textAnchor="middle" 
                  height={60}
                  tick={{ fontSize: 12 }}
                  interval={0}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="On-time %" fill="#0088FE" />
                <Bar dataKey="Quality" fill="#00C49F" />
                <Bar dataKey="Fulfillment %" fill="#FFBB28" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* PO Status Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Purchase Order Status</CardTitle>
            <CardDescription>Distribution of PO statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={poStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {poStatusData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Response Time Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Average Response Time</CardTitle>
            <CardDescription>Vendor response time in hours</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={responseTimeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={0} 
                  textAnchor="middle" 
                  height={60}
                  tick={{ fontSize: 12 }}
                  interval={0}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="Response Time (hrs)" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Quality Rating Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Quality Rating Trend</CardTitle>
            <CardDescription>Top vendors by quality rating</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={qualityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={0} 
                  textAnchor="middle" 
                  height={60}
                  tick={{ fontSize: 12 }}
                  interval={0}
                />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="Quality Rating"
                  stroke="#00C49F"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

