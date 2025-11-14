import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Users,
  TrendingUp,
  UserPlus,
  ChevronDown,
  Trophy,
  Medal,
  Award,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  useReferralSummary,
  useReferralLeaderboard,
  TIME_RANGES,
  getTimeRangeData,
} from "@/hooks/useReferralAnalytics";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ReferralDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("7d");
  const [weekOffset, setWeekOffset] = useState(0);

  const {
    data: summary,
    isLoading: summaryLoading,
    error: summaryError,
  } = useReferralSummary(timeRange);

  const {
    data: leaderboard,
    isLoading: leaderboardLoading,
    error: leaderboardError,
  } = useReferralLeaderboard(weekOffset, 20);

  const currentTimeRange = TIME_RANGES.find((tr) => tr.value === timeRange);
  const chartData = summary ? getTimeRangeData(timeRange, summary) : [];

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

  if (summaryError || leaderboardError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            Couldn't fetch referral data. Try again.
          </p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
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
      <motion.div
        variants={itemVariants}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-3xl font-bold">Referral Analytics</h1>
          <p className="text-muted-foreground">
            Track referral performance and top referrers
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              {currentTimeRange?.label || "Last 30 days"}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {TIME_RANGES.map((range) => (
              <DropdownMenuItem
                key={range.value}
                onClick={() => setTimeRange(range.value)}
              >
                {range.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {/* Total Referrals Card */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring" }}
        >
          <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-blue-100">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
                Total Referrals
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {summaryLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-blue-600">
                    {summary?.total_referrals?.toLocaleString() || "0"}
                  </div>
                  <div className="text-xs text-muted-foreground bg-blue-50 px-2 py-1 rounded-md w-fit">
                    Active users
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Total Referrers Card */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring" }}
        >
          <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-purple-100">
                  <UserPlus className="h-4 w-4 text-purple-600" />
                </div>
                Total Referrers
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {summaryLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-purple-600">
                    {summary?.total_referrers?.toLocaleString() || "0"}
                  </div>
                  <div className="text-xs text-muted-foreground bg-purple-50 px-2 py-1 rounded-md w-fit">
                    Contributors
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Average Referrals Card */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring" }}
        >
          <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-green-100">
                  <Award className="h-4 w-4 text-green-600" />
                </div>
                Avg. Referrals per Referrer
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {summaryLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-green-600">
                    {summary?.average_referrals_per_referrer?.toFixed(1) ||
                      "0.0"}
                  </div>
                  <div className="text-xs text-muted-foreground bg-green-50 px-2 py-1 rounded-md w-fit">
                    Performance metric
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Chart */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Referral Trends</CardTitle>
          </CardHeader>
          <CardContent>
            {summaryLoading || !chartData ? (
              <Skeleton className="h-80 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    dataKey={timeRange === "7d" ? "date" : "week"}
                    tick={{ fontSize: 12 }}
                    tickLine={{ opacity: 0.3 }}
                  />
                  <YAxis tick={{ fontSize: 12 }} tickLine={{ opacity: 0.3 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      border: "1px solid rgba(0, 0, 0, 0.1)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#8884d8"
                    strokeWidth={2}
                    dot={{ fill: "#8884d8", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Weekly Leaderboard */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Weekly Leaderboard</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setWeekOffset(weekOffset - 1)}
                disabled={weekOffset === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground min-w-[100px] text-center">
                {weekOffset === 0 ? "This Week" : `Week ${-weekOffset}`}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setWeekOffset(weekOffset + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {leaderboardLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))}
              </div>
            ) : !leaderboard?.length ? (
              <div className="text-center py-8">
                <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No referral data available for this week
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {leaderboard.map((entry, index) => {
                  const isTopThree = index < 3;
                  const rankIcon =
                    index === 0 ? (
                      <Trophy className="h-5 w-5 text-yellow-500" />
                    ) : index === 1 ? (
                      <Medal className="h-5 w-5 text-gray-400" />
                    ) : index === 2 ? (
                      <Award className="h-5 w-5 text-amber-600" />
                    ) : (
                      <span className="text-sm font-medium text-muted-foreground w-8 text-center">
                        #{entry.rank}
                      </span>
                    );

                  return (
                    <motion.div
                      key={entry.user_id}
                      whileHover={{ x: 4 }}
                      transition={{ type: "spring" }}
                    >
                      <Link to={`/referral/${entry.user_id}`}>
                        <div
                          className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
                            isTopThree
                              ? "bg-gradient-to-r from-amber-50/50 to-yellow-50/50 border border-amber-200/30"
                              : "hover:bg-muted/50"
                          }`}
                        >
                          <div className="flex items-center justify-center w-8">
                            {rankIcon}
                          </div>

                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={entry.avatar || undefined}
                              alt={entry.display_name}
                            />
                            <AvatarFallback>
                              {entry.display_name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium truncate">
                                {entry.display_name}
                              </p>
                              <Badge variant="secondary" className="text-xs">
                                @{entry.username}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Member since{" "}
                              {new Date(entry.created_at).getFullYear()}
                            </p>
                          </div>

                          <div className="text-right">
                            <div className="font-bold text-lg">
                              {entry.referral_count}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {entry.recent_referrals} recent
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default ReferralDashboard;
