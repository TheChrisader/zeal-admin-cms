import React from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  BarChart as BarChartIcon,
  FileText,
  Bot,
  TrendingUp,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
} from "lucide-react";
import {
  useAnalyticsData,
  getPostSourceBreakdown,
  getTopPostsByViews,
  getCategoryChartData,
} from "@/hooks/useAnalyticsData";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CATEGORIES } from "@/constants/categories";

const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7c7c",
  "#8dd1e1",
  "#d084d0",
];

const DashboardPage: React.FC = () => {
  const { data: analytics, isLoading, error, refetch } = useAnalyticsData();

  const postBreakdown = getPostSourceBreakdown(analytics);
  const topPosts = getTopPostsByViews(analytics, 10);
  const categoryData = getCategoryChartData(analytics);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            Couldn't fetch analytics data. Please try again.
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <div>
          <h1 className="text-3xl font-bold text-indigo-700/80">
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground">
            Overview of content performance and distribution for{" "}
            {new Date().toLocaleDateString("en-CA")}
          </p>
        </div>
      </motion.div>

      {/* Metric Cards */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* User Generated Posts Card */}
        <motion.div
          whileHover={{
            scale: 1.02,
            boxShadow:
              "0 10px 25px -5px rgba(99, 102, 241, 0.1), 0 10px 10px -5px rgba(99, 102, 241, 0.04)",
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Card className="relative overflow-hidden border border-indigo-200 bg-gradient-to-br from-white to-gray-50/50 hover:from-indigo-50/30 hover:to-white transition-all duration-300">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-indigo-400/5 to-transparent rounded-bl-full" />
            <CardHeader className="relative">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <div className="p-1.5 bg-indigo-100 rounded-lg">
                  <FileText className="h-4 w-4 text-indigo-700" />
                </div>
                User Generated Posts
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-indigo-900">
                    {postBreakdown.userGenerated.toLocaleString()}
                  </div>
                  {postBreakdown.total > 0 && (
                    <div className="text-sm text-indigo-700 bg-indigo-50 px-2 py-1 rounded-md inline-block">
                      {(
                        (postBreakdown.userGenerated / postBreakdown.total) *
                        100
                      ).toFixed(1)}
                      % of total posts
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Auto Generated Posts Card */}
        <motion.div
          whileHover={{
            scale: 1.02,
            boxShadow:
              "0 10px 25px -5px rgba(34, 197, 94, 0.1), 0 10px 10px -5px rgba(34, 197, 94, 0.04)",
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Card className="relative overflow-hidden border border-green-200 bg-gradient-to-br from-white to-gray-50/50 hover:from-green-50/30 hover:to-white transition-all duration-300">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-400/5 to-transparent rounded-bl-full" />
            <CardHeader className="relative">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <div className="p-1.5 bg-green-100 rounded-lg">
                  <Bot className="h-4 w-4 text-green-700" />
                </div>
                Auto Generated Posts
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-indigo-900">
                    {postBreakdown.autoGenerated.toLocaleString()}
                  </div>
                  {postBreakdown.total > 0 && (
                    <div className="text-sm text-indigo-700 bg-green-50 px-2 py-1 rounded-md inline-block">
                      {(
                        (postBreakdown.autoGenerated / postBreakdown.total) *
                        100
                      ).toFixed(1)}
                      % of total posts
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Category Distribution Chart */}
        <motion.div
          variants={itemVariants}
          whileHover={{
            y: -2,
            boxShadow:
              "0 10px 25px -5px rgba(99, 102, 241, 0.1), 0 10px 10px -5px rgba(99, 102, 241, 0.04)",
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Card className="border border-indigo-200 bg-gradient-to-br from-white to-gray-50/30 transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-indigo-50/50 to-transparent border-b border-indigo-100">
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <BarChartIcon className="h-4 w-4 text-indigo-700" />
                </div>
                Posts by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-80 w-full" />
              ) : !categoryData.length ? (
                <div className="flex items-center justify-center h-80 text-muted-foreground">
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No category data available</p>
                  </div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={categoryData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="opacity-30"
                    />
                    <XAxis
                      dataKey="category"
                      tick={{ fontSize: 12 }}
                      tickLine={{ opacity: 0.3 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickLine={{ opacity: 0.3 }}
                      width={10}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        border: "1px solid rgba(0, 0, 0, 0.1)",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                      {categoryData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Posts Leaderboard */}
        <motion.div
          variants={itemVariants}
          whileHover={{
            y: -2,
            boxShadow:
              "0 10px 25px -5px rgba(99, 102, 241, 0.1), 0 10px 10px -5px rgba(99, 102, 241, 0.04)",
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Card className="border border-indigo-200 bg-gradient-to-br from-white to-gray-50/30 transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-indigo-50/50 to-transparent border-b border-indigo-100">
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Eye className="h-4 w-4 text-indigo-700" />
                </div>
                <span>Top Posts by Views</span>
                <span className="opacity-75 text-xs">(Not Realtime)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <div className="flex gap-2">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-6 w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : !topPosts.length ? (
                <div className="flex items-center justify-center h-80 text-muted-foreground">
                  <div className="text-center">
                    <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No post data available</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 max-h-80 pr-4 py-1 overflow-y-auto">
                  {topPosts.map((post, index) => (
                    <motion.div
                      key={post.id}
                      whileHover={{ x: 4 }}
                      transition={{ type: "spring" }}
                      className="border-l-2 border-indigo-200 pl-4 py-2"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-medium text-indigo-900 line-clamp-2 text-sm leading-tight">
                            {post.title}
                          </h4>
                          <div className="flex items-center gap-1 text-indigo-600 whitespace-nowrap">
                            <Eye className="h-3 w-3" />
                            <span className="font-semibold text-sm">
                              {parseInt(post.views).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex flex-wrap gap-1">
                            {post.category.slice(0, 2).map((cat, catIndex) => (
                              <Badge
                                key={catIndex}
                                variant="secondary"
                                className="text-xs bg-indigo-50 text-indigo-700 border-indigo-200"
                              >
                                {cat}
                              </Badge>
                            ))}
                            {post.category.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{post.category.length - 2}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-xs text-indigo-600 font-mono bg-indigo-50 px-2 py-1 rounded">
                          {post.path}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Summary Stats */}
      {analytics && (
        <motion.div
          variants={itemVariants}
          whileHover={{
            y: -2,
            boxShadow:
              "0 10px 25px -5px rgba(99, 102, 241, 0.1), 0 10px 10px -5px rgba(99, 102, 241, 0.04)",
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Card className="border border-indigo-200 bg-gradient-to-br from-white to-gray-50/30 transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-indigo-50/50 to-transparent border-b border-indigo-100">
              <CardTitle className="text-indigo-900 flex items-center gap-2">
                <div className="p-1.5 bg-indigo-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-indigo-700" />
                </div>
                Content Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {/* Total Posts */}
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl transform scale-95 group-hover:scale-100 transition-transform duration-300 opacity-50" />
                  <div className="relative text-center p-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-3">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="text-3xl font-bold text-indigo-900 mb-1">
                      {postBreakdown.total.toLocaleString()}
                    </div>
                    <div className="text-sm text-indigo-700 font-medium">
                      Total Posts
                    </div>
                  </div>
                </div>

                {/* Categories */}
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl transform scale-95 group-hover:scale-100 transition-transform duration-300 opacity-50" />
                  <div className="relative text-center p-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-3">
                      <BarChartIcon className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="text-3xl font-bold text-indigo-900 mb-1">
                      {`${analytics.category_distribution.length} / ${CATEGORIES.length}`}
                    </div>
                    <div className="text-sm text-indigo-700 font-medium">
                      Categories
                    </div>
                  </div>
                </div>

                {/* Average Views */}
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl transform scale-95 group-hover:scale-100 transition-transform duration-300 opacity-50" />
                  <div className="relative text-center p-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-3">
                      <TrendingUp className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="text-3xl font-bold text-indigo-900 mb-1">
                      {topPosts.length > 0
                        ? Math.round(
                            topPosts.reduce(
                              (sum, post) => sum + parseInt(post.views),
                              0
                            ) / topPosts.length
                          ).toLocaleString()
                        : "0"}
                    </div>
                    <div className="text-sm text-indigo-700 font-medium">
                      Avg. Views
                    </div>
                  </div>
                </div>

                {/* Highest Views */}
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl transform scale-95 group-hover:scale-100 transition-transform duration-300 opacity-50" />
                  <div className="relative text-center p-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mb-3">
                      <Eye className="h-6 w-6 text-orange-600" />
                    </div>
                    <div className="text-3xl font-bold text-indigo-900 mb-1">
                      {topPosts.length > 0
                        ? parseInt(topPosts[0].views).toLocaleString()
                        : "0"}
                    </div>
                    <div className="text-sm text-indigo-700 font-medium">
                      Highest Views
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress indicators */}
              <div className="mt-6 pt-6 border-t border-indigo-100">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm text-muted-foreground">
                      Content generation active
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    <span className="text-sm text-muted-foreground">
                      Analytics up to date
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                    <span className="text-sm text-muted-foreground">
                      {new Date().toLocaleDateString()} data
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
};

export default DashboardPage;
