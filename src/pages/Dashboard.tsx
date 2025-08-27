import { useEffect } from "react";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
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

const DashboardSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <Skeleton className="h-10 w-64" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Activity Over Time Card */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-32 mt-2" />
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center">
              <Skeleton className="h-64 w-full rounded-xl" />
            </div>
          </CardContent>
        </Card>

        {/* Engagement Metrics Card */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-40 mt-2" />
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center">
              <Skeleton className="h-64 w-full rounded-xl" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const DashboardPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // setIsLoading(true);
        const data = await apiClient(`/api/v1/admin?timeRange=24h`);
        const graphData = [];
        for (let i = 0; i < data.intervals.length; i++) {
          graphData.push({
            interval: data.intervals[i],
            users: data.users.timeSeries[i].count,
            posts: data.posts.timeSeries[i].count,
            pwaInstalls: data.pwaInstalls.timeSeries[i].count,
          });
        }
        setAnalyticsData(graphData);
      } catch {
        console.log("error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Activity Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Site Activity Overview</CardTitle>
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
                    animationDuration={5000}
                    type="monotone"
                    dataKey="posts"
                    stroke="#8884d8"
                    strokeWidth={2}
                    name="Posts"
                  />
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
              User engagement (Account Creation)
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
                    name="Account Creation"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
