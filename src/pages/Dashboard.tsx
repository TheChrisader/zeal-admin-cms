import React, { useEffect } from "react";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Users,
  FileText,
  Flag,
  MessageSquare,
  Download,
} from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import { Skeleton } from "@/components/ui/skeleton";

const getPublishTimeStamp = (timestamp: string) => {
  if (!timestamp) {
    return timestamp;
  }

  const date = new Date(timestamp);
  const now = new Date();

  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    // minute: 60,
    // second: 1,
  };

  for (const [key, value] of Object.entries(intervals)) {
    const count = Math.floor(seconds / value);
    if (count >= 1) {
      return `${count} ${key}${count > 1 ? "s" : ""} ago`;
    }
  }

  return "Just now";
};

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const DashboardPage = () => {
  const [timeRange, setTimeRange] = useState("6d");
  const [isLoading, setIsLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);
  const [roleDistribution, setRoleDistribution] = useState<any[]>([]);
  const [categoryDistribution, setCategoryDistribution] = useState<any[]>([]);
  const [installEventDistribution, setInstallEventDistribution] = useState<
    any[]
  >([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient(
          `/api/v1/admin?timeRange=${timeRange}`
        );
        const data = await response.json();
        const graphData = [];
        for (let i = 0; i < data.intervals.length; i++) {
          graphData.push({
            interval: data.intervals[i],
            users: data.users.timeSeries[i].count,
            posts: data.posts.timeSeries[i].count,
            pwaInstalls: data.pwaInstalls.timeSeries[i].count,
          });
        }
        console.log(data);
        setAnalyticsData(graphData);
        setRoleDistribution(data.roleDistribution);
        setCategoryDistribution(data.categoryDistribution);
        setInstallEventDistribution(data.installEventDistribution);
      } catch {
        console.log("error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [timeRange]);

  const StatCard = ({
    title,
    value,
    change,
    icon: Icon,
    trend,
  }: {
    title: string;
    value: string;
    change: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    trend: "up" | "down";
  }) => {
    if (isLoading) {
      return <Skeleton className="h-32" />;
    }

    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {title}
              </p>
              <h3 className="text-2xl font-bold mt-2">{value}</h3>
              {/* <div className="flex items-center mt-2">
                {trend === "up" ? (
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                )}
                <span
                  className={`text-sm ${
                    trend === "up" ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {change}
                </span>
              </div> */}
            </div>
            <div className="p-3 bg-primary/10 rounded-full">
              <Icon className="w-6 h-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <Select defaultValue={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Last 24 hours</SelectItem>
            <SelectItem value="6d">Last 6 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={analyticsData.reduce((acc, curr) => acc + curr?.users, 0)}
          change={
            (analyticsData[analyticsData.length - 1]?.users /
              analyticsData[analyticsData.length - 2]?.users || 0) *
              100 +
            "%"
          }
          icon={Users}
          trend="up"
        />
        <StatCard
          title="Total Posts"
          value={analyticsData.reduce((acc, curr) => acc + curr?.posts, 0)}
          change={
            (analyticsData[analyticsData.length - 1]?.posts /
              analyticsData[analyticsData.length - 2]?.posts) *
              100 +
            "%"
          }
          icon={FileText}
          trend="up"
        />
        <StatCard
          title="PWA Install Clicks"
          value={analyticsData.reduce(
            (acc, curr) => acc + curr?.pwaInstalls,
            0
          )}
          change="-8.4%"
          icon={Download}
          trend="down"
        />
        {/* <StatCard
          title="Flagged Content"
          value="64.8%"
          change="+5.2%"
          icon={MessageSquare}
          trend="up"
        /> */}
      </div>

      {/* Charts */}
      {isLoading ? (
        <Skeleton className="h-80" />
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Activity Over Time */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Overview</CardTitle>
              <CardDescription>Posts over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyticsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      /* dataKey="name" */ dataKey={(value) => {
                        return getPublishTimeStamp(value.interval);
                      }}
                    />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="posts"
                      stroke="#8884d8"
                      strokeWidth={2}
                      name="Posts"
                    />
                    {/* <Line
                    type="monotone"
                    dataKey="users"
                    stroke="#82ca9d"
                    strokeWidth={2}
                    name="Users"
                  /> */}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Engagement Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Engagement Metrics</CardTitle>
              <CardDescription>
                User engagement and flagged content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analyticsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey={(value) => {
                        return getPublishTimeStamp(value.interval);
                      }}
                    />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="users"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.3}
                      name="Account Creation %"
                    />
                    {/* <Area
                    type="monotone"
                    dataKey="flaggedContent"
                    stroke="#82ca9d"
                    fill="#82ca9d"
                    fillOpacity={0.3}
                    name="Flagged Content"
                  /> */}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* User Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>User Distribution</CardTitle>
              <CardDescription>Breakdown by user type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={roleDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="count"
                      nameKey="category"
                    >
                      {roleDistribution.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Content Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Content Categories</CardTitle>
              <CardDescription>Distribution of content types</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8">
                      {categoryDistribution.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
