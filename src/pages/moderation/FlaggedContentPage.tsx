import React, { useState } from "react";
import { motion } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FlaggedContent } from "./types";
import { mockApi } from "./api/mockApi";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
// import { PermissionGuard } from './PermissionGuard';
import {
  AlertCircle,
  Filter,
  CheckCircle2,
  XCircle,
  Eye,
  Link2,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { apiClient } from "@/lib/apiClient";
import { Link } from "react-router-dom";

const ContentModerationQueue = () => {
  const [selectedContent, setSelectedContent] = useState<any | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    status: "PENDING",
    contentType: "ALL",
    minReports: "",
  });

  const queryClient = useQueryClient();

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

  // Fetch flagged content with filters
  const { data: flaggedContent = [], isLoading } = useQuery({
    queryKey: ["flaggedContent", filters],
    queryFn: async () => {
      try {
        const response = await apiClient(`/api/v1/admin/flagged`);
        // if (!response.ok) {
        //   throw new Error(`HTTP error! status: ${response.status}`);
        // }
        // const data = await response.json();
        // console.log(data);
        return response;
      } catch (error) {
        console.log(error);
        return [];
      }
    },
  });

  // Update content status mutation
  const updateContentMutation = useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: "APPROVED" | "REJECTED";
    }) => {
      await mockApi.updateContentStatus(id, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flaggedContent"] });
      setSelectedContent(null);
      setSelectedItems([]);
    },
  });

  // Bulk update mutation
  const bulkUpdateMutation = useMutation({
    mutationFn: async ({
      ids,
      status,
    }: {
      ids: string[];
      status: "APPROVED" | "REJECTED";
    }) => {
      await Promise.all(
        ids.map((id) => mockApi.updateContentStatus(id, status))
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flaggedContent"] });
      setSelectedItems([]);
    },
  });

  const ContentPreview = ({ content }: { content: any }) => {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium">
              Content ID: {content._id.toString()}
            </h3>
            {/* <p className="text-sm text-gray-500">
              Flagged: {new Date(content.flaggedAt).toLocaleString()}
            </p> */}
          </div>
          <Badge
            variant={
              "default"
              // content.status === "PENDING"
              //   ? "default"
              //   : content.status === "APPROVED"
              //   ? "secondary"
              //   : "destructive"
            }
          >
            {/* {content.status} */}
            PENDING
          </Badge>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Report Details</AlertTitle>
          <AlertDescription>
            <div className="mt-2">
              <p>Report Count: {content.reportsCount}</p>
              <p>
                Reasons:{" "}
                {content.reports
                  .map((report: any) => {
                    if (report.reason === "other") return report.description;
                    return report.reason;
                  })
                  .join(", ")}
              </p>
            </div>
          </AlertDescription>
        </Alert>

        {/* <div className="mt-4 p-4 bg-gray-50 rounded-md">
          <h4 className="font-medium mb-2">Content Preview</h4>
          <p className="text-sm">{content.contentPreview}</p>
        </div> */}

        <div className="flex justify-end space-x-2 mt-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="destructive"
              onClick={() =>
                updateContentMutation.mutate({
                  id: content.id,
                  status: "REJECTED",
                })
              }
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject
            </Button>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="default"
              onClick={() =>
                updateContentMutation.mutate({
                  id: content.id,
                  status: "APPROVED",
                })
              }
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Approve
            </Button>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              className="bg-primary hover:bg-primary/90 px-4 py-2 rounded-md flex items-center justify-center text-white text-sm font-medium"
              to={`/articles/${content._id.toString()}`}
            >
              <Link2 className="w-4 h-4 mr-2" />
              Go to Article
            </Link>
          </motion.div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">Loading...</div>
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
        <Card className="w-full p-0 bg-transparent border-0">
          <CardHeader className="p-0 pb-4">
            <div className="flex items-center space-y-2 justify-between">
              <div className="flex flex-col space-y-1">
                <CardTitle className="text-indigo-500 font-bold">
                  Content Moderation Queue
                </CardTitle>
                <CardDescription>
                  Review and moderate flagged content
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                {selectedItems.length > 0 && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="flex items-center space-x-2"
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant="destructive"
                        onClick={() =>
                          bulkUpdateMutation.mutate({
                            ids: selectedItems,
                            status: "REJECTED",
                          })
                        }
                      >
                        Reject Selected
                      </Button>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant="default"
                        onClick={() =>
                          bulkUpdateMutation.mutate({
                            ids: selectedItems,
                            status: "APPROVED",
                          })
                        }
                      >
                        Approve Selected
                      </Button>
                    </motion.div>
                  </motion.div>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Filters and Content */}
      <motion.div variants={itemVariants}>
        <Card className="w-full">
          <CardContent className="pt-6">
        <div className="mb-4 flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filters:</span>
          </div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Select
              value={filters.status}
              onValueChange={(value) =>
                setFilters((prev) => ({ ...prev, status: value }))
              }
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Select
              value={filters.contentType}
              onValueChange={(value) =>
                setFilters((prev) => ({ ...prev, contentType: value }))
              }
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Content Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                <SelectItem value="ARTICLE">Articles</SelectItem>
                <SelectItem value="COMMENT">Comments</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Input
              type="number"
              placeholder="Min Reports"
              className="w-[150px]"
              value={filters.minReports}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  minReports: e.target.value,
                }))
              }
            />
          </motion.div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={selectedItems.length === flaggedContent.length}
                  onCheckedChange={(checked) => {
                    setSelectedItems(
                      checked
                        ? flaggedContent?.map((c: any) => c._id.toString())
                        : []
                    );
                  }}
                />
              </TableHead>
              <TableHead>Content Type</TableHead>
              <TableHead>Content</TableHead>
              <TableHead>Reports</TableHead>
              <TableHead>Status</TableHead>
              {/* <TableHead>Flagged Date</TableHead> */}
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {flaggedContent?.map((content: any, index: number) => (
              <motion.tr
                key={content._id.toString()}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.01, backgroundColor: "rgba(99, 102, 241, 0.05)" }}
              >
                <TableCell>
                  <Checkbox
                    checked={selectedItems.includes(content.id)}
                    onCheckedChange={(checked) => {
                      setSelectedItems((prev) =>
                        checked
                          ? [...prev, content._id.toString()]
                          : prev.filter((id) => id !== content._id.toString())
                      );
                    }}
                  />
                </TableCell>
                <TableCell>{/* content.contentType */ "ARTICLE"}</TableCell>
                <TableCell className="max-w-[300px] truncate">
                  {content.title}
                </TableCell>
                <TableCell>{content.reportsCount}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      "default"
                      // content.status === "PENDING"
                      //   ? "default"
                      //   : content.status === "APPROVED"
                      //   ? "secondary"
                      //   : "destructive"
                    }
                  >
                    {/* {content.status} */}
                    PENDING
                  </Badge>
                </TableCell>
                {/* <TableCell>
                  {new Date(content.created_at).toLocaleString()}
                </TableCell> */}
                <TableCell>
                  <Dialog
                    open={
                      selectedContent?._id.toString() === content._id.toString()
                    }
                    onOpenChange={(open) =>
                      setSelectedContent(open ? content : null)
                    }
                  >
                    <DialogTrigger asChild>
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Button variant="ghost" size="icon">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-xl">
                      <DialogHeader>
                        <DialogTitle>Review Content</DialogTitle>
                        <DialogDescription>
                          Review flagged content and take appropriate action
                        </DialogDescription>
                      </DialogHeader>
                      <ContentPreview content={content} />
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default ContentModerationQueue;
