import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
  ArrowLeft,
  Users,
  TrendingUp,
  Calendar,
  Mail,
  Copy,
  Check,
  Clock,
  UserPlus,
  UserCheck,
  AlertCircle,
  BarChart3,
} from "lucide-react";
import { useUserReferralAnalytics } from "@/hooks/useReferralAnalytics";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

const UserReferralAnalytics: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [copiedCode, setCopiedCode] = React.useState(false);

  const {
    data: analytics,
    isLoading,
    error,
  } = useUserReferralAnalytics(userId || "");

  // Calculate weekly referrals from daily data (sum of last 7 days)
  const getWeeklyReferrals = () => {
    if (!analytics || !analytics.daily_referrals.length) return 0;
    // Get the last 7 days of data
    const last7Days = analytics.daily_referrals.slice(-7);
    return last7Days.reduce((sum, day) => sum + day.count, 0);
  };

  const handleCopyReferralCode = async () => {
    if (!analytics?.user?.referral_code) return;

    try {
      await navigator.clipboard.writeText(analytics.user.referral_code);
      setCopiedCode(true);
      toast.success("Referral code copied to clipboard");
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (err) {
      toast.error("Failed to copy referral code");
    }
  };

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
            Couldn't fetch user referral data. Try again.
          </p>
          <div className="space-x-2">
            <Button onClick={() => window.location.reload()}>Retry</Button>
            <Button variant="outline" onClick={() => navigate("/referral")}>
              Back to Dashboard
            </Button>
          </div>
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
      {/* Back Button */}
      <motion.div variants={itemVariants}>
        <Button
          variant="ghost"
          onClick={() => navigate("/referral")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Referral Dashboard
        </Button>
      </motion.div>

      {/* User Header */}
      <motion.div variants={itemVariants}>
        <Card className="sticky top-6 z-10 backdrop-blur-sm bg-background/95 border shadow-sm">
          <CardContent className="p-6">
            {isLoading ? (
              <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-64" />
                  <Skeleton className="h-4 w-40" />
                </div>
              </div>
            ) : analytics ? (
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src={analytics.user.avatar || undefined}
                    alt={analytics.user.display_name}
                  />
                  <AvatarFallback className="text-lg">
                    {analytics.user.display_name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h1 className="text-2xl font-bold">
                        {analytics.user.display_name}
                      </h1>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary">
                          @{analytics.user.username}
                        </Badge>
                        <span className="text-muted-foreground text-sm">
                          User ID: {analytics.user.id}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span>{analytics.user.email}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Member since{" "}
                          {new Date(
                            analytics.user.created_at
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm text-muted-foreground mb-2">
                        Referral Code
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="font-mono text-base px-3 py-1"
                        >
                          {analytics.user.referral_code}
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleCopyReferralCode}
                          className="h-8 w-8 p-0"
                        >
                          {copiedCode ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {/* Total Referrals */}
        <motion.div
          whileHover={{ y: -6, scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Card className="relative overflow-hidden border border-blue-100/70 dark:border-blue-900/40 bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-900 dark:to-blue-950/20 hover:shadow-lg hover:shadow-blue-500/10 dark:hover:shadow-blue-400/5 transition-all duration-400">
            {/* Subtle accent */}
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-500/8 to-transparent rounded-bl-full" />

            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-3">
                <motion.div
                  className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/25"
                  whileHover={{ rotate: 90, scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 600, damping: 15 }}
                >
                  <Users className="h-4 w-4" />
                </motion.div>
                <span className="font-medium">Total Referrals</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {isLoading ? (
                <Skeleton className="h-10 w-20" />
              ) : analytics ? (
                <div className="space-y-2">
                  <motion.div
                    className="text-3xl font-bold text-blue-600 dark:text-blue-400"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    {analytics.referral_stats.total_referrals.toLocaleString()}
                  </motion.div>
                  <div className="h-0.5 w-12 bg-blue-200 dark:bg-blue-800 rounded-full" />
                </div>
              ) : null}
            </CardContent>
          </Card>
        </motion.div>

        {/* Weekly Referrals */}
        <motion.div
          whileHover={{ y: -6, scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Card className="relative overflow-hidden border border-emerald-100/70 dark:border-emerald-900/40 bg-gradient-to-br from-white to-emerald-50/30 dark:from-gray-900 dark:to-emerald-950/20 hover:shadow-lg hover:shadow-emerald-500/10 dark:hover:shadow-emerald-400/5 transition-all duration-400">
            {/* Subtle accent */}
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-emerald-500/8 to-transparent rounded-bl-full" />

            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-3">
                <motion.div
                  className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-500/25"
                  whileHover={{ rotate: 90, scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 600, damping: 15 }}
                >
                  <BarChart3 className="h-4 w-4" />
                </motion.div>
                <span className="font-medium">Referrals This Week</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {isLoading ? (
                <Skeleton className="h-10 w-20" />
              ) : analytics ? (
                <div className="space-y-2">
                  <motion.div
                    className="text-3xl font-bold text-emerald-600 dark:text-emerald-400"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    {getWeeklyReferrals().toLocaleString()}
                  </motion.div>
                  <div className="h-0.5 w-12 bg-emerald-200 dark:bg-emerald-800 rounded-full" />
                </div>
              ) : null}
            </CardContent>
          </Card>
        </motion.div>

        {/* Conversion Rate */}
        {/* <motion.div
          whileHover={{ y: -6, scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <Card className="relative overflow-hidden border border-purple-100/70 dark:border-purple-900/40 bg-gradient-to-br from-white to-purple-50/30 dark:from-gray-900 dark:to-purple-950/20 hover:shadow-lg hover:shadow-purple-500/10 dark:hover:shadow-purple-400/5 transition-all duration-400">
            
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-purple-500/8 to-transparent rounded-bl-full" />

            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-3">
                <motion.div
                  className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-md shadow-purple-500/25"
                  whileHover={{ rotate: 90, scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 600, damping: 15 }}
                >
                  <TrendingUp className="h-4 w-4" />
                </motion.div>
                <span className="font-medium">Conversion Rate</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {isLoading ? (
                <Skeleton className="h-10 w-20" />
              ) : analytics ? (
                <div className="space-y-2">
                  <motion.div
                    className="text-3xl font-bold text-purple-600 dark:text-purple-400"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    {analytics.referral_stats.referral_conversion_rate}%
                  </motion.div>
                  <div className="h-0.5 w-12 bg-purple-200 dark:bg-purple-800 rounded-full" />
                </div>
              ) : null}
            </CardContent>
          </Card>
        </motion.div> */}
      </motion.div>

      {/* Daily Referrals Chart */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Daily Referral Performance</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading || !analytics ? (
              <Skeleton className="h-80 w-full" />
            ) : analytics.daily_referrals.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={analytics.daily_referrals}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    dataKey="date"
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
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={{ fill: "#6366f1", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-80">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No daily data available yet
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Referrals */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Recent Referrals</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                  </div>
                ))}
              </div>
            ) : analytics &&
              analytics.referral_stats.recent_referrals.length > 0 ? (
              <div className="space-y-4">
                {analytics.referral_stats.recent_referrals.map((referral) => (
                  <motion.div
                    key={referral.id}
                    whileHover={{ x: 4 }}
                    transition={{ type: "spring" }}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={referral.avatar || undefined}
                        alt={referral.display_name}
                      />
                      <AvatarFallback>
                        {referral.display_name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">
                          {referral.display_name}
                        </p>
                        <Badge variant="secondary" className="text-xs">
                          @{referral.username}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-sm text-muted-foreground">
                          Joined{" "}
                          {new Date(referral.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No referrals found yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default UserReferralAnalytics;
