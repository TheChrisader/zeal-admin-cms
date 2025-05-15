"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, ChevronDown, ChevronUp, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
import {
  mockWriterRequests,
  mockUsers,
  type WriterRequest,
  type IUser,
} from "@/types/user";
import { apiClient } from "@/lib/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface WriterRequestsProps {
  onApprove: (userId: string) => void;
  onReject: (userId: string) => void;
}

const fetchRequests = async () => {
  try {
    const response = await apiClient(`/api/v1/admin/writer-request`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to fetch requests"
    );
  }
};

export function WriterRequests({ onApprove, onReject }: WriterRequestsProps) {
  const [, setRequests] = useState<WriterRequest[]>(mockWriterRequests);
  const [expandedRequest, setExpandedRequest] = useState<string | null>(null);
  const [processingRequests, setProcessingRequests] = useState<
    { id: string; action: "approve" | "reject" }[]
  >([]);
  const queryClient = useQueryClient();

  const {
    data: requests,
    isLoading,
    error,
  }: any = useQuery({
    queryKey: ["writer-request"],
    queryFn: () => fetchRequests(),
  });

  const approveMutation = useMutation({
    mutationFn: async (request: WriterRequest) => {
      await onApprove(request.id);
      return request;
    },
    onSuccess: (request) => {
      queryClient.invalidateQueries({ queryKey: ["writer-request"] });
      setRequests((prev) => prev.filter((r) => r.id !== request.id));
      setProcessingRequests((prev) => prev.filter((r) => r.id !== request.id));
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (request: WriterRequest) => {
      await onReject(request.id);
      return request;
    },
    onSuccess: (request) => {
      queryClient.invalidateQueries({ queryKey: ["writer-request"] });
      setRequests((prev) => prev.filter((r) => r.id !== request.id));
      setProcessingRequests((prev) => prev.filter((r) => r.id !== request.id));
    },
  });

  const handleApprove = (request: WriterRequest) => {
    console.log(request);
    setProcessingRequests((prev) => [
      ...prev,
      { id: request?.id, action: "approve" },
    ]);
    approveMutation.mutate(request);
  };

  const handleReject = (request: WriterRequest) => {
    setProcessingRequests((prev) => [
      ...prev,
      { id: request?.id, action: "reject" },
    ]);
    rejectMutation.mutate(request);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] text-destructive">
        <p>Error loading requests</p>
        <p className="text-sm">
          {error instanceof Error ? error.message : "Something went wrong"}
        </p>
      </div>
    );
  }

  const getUser = (userId: string): IUser | undefined => {
    return mockUsers.find((user) => user.id === userId);
  };

  const toggleExpand = (requestId: string) => {
    setExpandedRequest(expandedRequest === requestId ? null : requestId);
  };

  return (
    <div className="space-y-6">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold"
      >
        Writer Requests
      </motion.h2>
      {requests?.length === 0 ? (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-gray-500"
        >
          No pending writer requests.
        </motion.p>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid gap-4 grid-cols-1"
        >
          <AnimatePresence>
            {requests &&
              requests?.map((request) => {
                // const user = getUser(request?.user_id);
                return (
                  <motion.div
                    key={request?.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="h-full flex flex-col">
                      <CardHeader>
                        <CardTitle>{request?.brand_name}</CardTitle>
                        <CardDescription>
                          {request?.name || "Unknown User"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <p className="text-sm text-muted-foreground mb-2">
                          Requested on{" "}
                          {new Date(request?.created_at).toLocaleDateString()}
                        </p>
                        <motion.div
                          initial={false}
                          animate={{
                            height:
                              expandedRequest === request?.id ? "auto" : 0,
                          }}
                          className="overflow-hidden"
                        >
                          <div className="space-y-2">
                            <h4 className="font-semibold">Social Media:</h4>
                            <ul className="list-disc list-inside">
                              {Object.values(request?.social_platforms).map(
                                // ([index, { platform, url }]) => {
                                ({ platform, url }: any) => {
                                  return (
                                    <li key={platform}>
                                      {platform}:{" "}
                                      <a
                                        href={url as string}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-500 hover:underline"
                                      >
                                        {url as string}
                                      </a>
                                    </li>
                                  );
                                }
                              )}
                            </ul>
                            <p>
                              <span className="font-semibold">
                                Major Publisher:
                              </span>{" "}
                              {request?.is_major_publisher ? "Yes" : "No"}
                            </p>
                            <p>
                              <span className="font-semibold">Freelance:</span>{" "}
                              {request?.is_freelance ? "Yes" : "No"}
                            </p>
                            <p>
                              <span className="font-semibold">
                                Will Upload Video:
                              </span>{" "}
                              {request?.will_upload_video ? "Yes" : "No"}
                            </p>
                            <p>
                              <span className="font-semibold">
                                Will Upload Audio:
                              </span>{" "}
                              {request?.will_upload_audio ? "Yes" : "No"}
                            </p>
                          </div>
                        </motion.div>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Button
                          variant="outline"
                          onClick={() => toggleExpand(request?.id)}
                          className="flex items-center"
                        >
                          {expandedRequest === request?.id ? (
                            <>
                              <ChevronUp className="mr-2 h-4 w-4" />
                              Less Details
                            </>
                          ) : (
                            <>
                              <ChevronDown className="mr-2 h-4 w-4" />
                              More Details
                            </>
                          )}
                        </Button>
                        <div className="space-x-2">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReject(request)}
                            disabled={
                              // rejectMutation.isPending ||
                              processingRequests.some(
                                (r) =>
                                  r.id === request?.id && r.action === "approve"
                              )
                            }
                          >
                            {processingRequests.some(
                              (r) =>
                                r.id === request?.id && r.action === "reject"
                            ) ? (
                              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            ) : (
                              <X className="h-4 w-4 mr-1" />
                            )}
                            {processingRequests.some(
                              (r) =>
                                r.id === request?.id && r.action === "reject"
                            )
                              ? "Rejecting..."
                              : "Reject"}
                          </Button>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleApprove(request)}
                            disabled={
                              // approveMutation.isPending ||
                              processingRequests.some(
                                (r) =>
                                  r.id === request?.id && r.action === "reject"
                              )
                            }
                          >
                            {processingRequests.some(
                              (r) =>
                                r.id === request?.id && r.action === "approve"
                            ) ? (
                              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            ) : (
                              <Check className="h-4 w-4 mr-1" />
                            )}
                            {processingRequests.some(
                              (r) =>
                                r.id === request?.id && r.action === "approve"
                            )
                              ? "Approving..."
                              : "Approve"}
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  </motion.div>
                );
              })}
          </AnimatePresence>
        </motion.div>
      )}

      {/* <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedRequest?.brand_name}</DialogTitle>
            <DialogDescription>Writer Request Details</DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold">Social Media:</h4>
                <ul className="list-disc list-inside">
                  {Object.entries(selectedRequest.social_media).map(
                    ([platform, link]) => (
                      <li key={platform}>
                        {platform}:{" "}
                        <a
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          {link}
                        </a>
                      </li>
                    )
                  )}
                </ul>
              </div>
              <div className="space-y-2">
                <p>
                  <span className="font-semibold">Major Publisher:</span>{" "}
                  {selectedRequest.is_major_publisher ? "Yes" : "No"}
                </p>
                <p>
                  <span className="font-semibold">Freelance:</span>{" "}
                  {selectedRequest.is_freelance ? "Yes" : "No"}
                </p>
                <p>
                  <span className="font-semibold">Will Upload Video:</span>{" "}
                  {selectedRequest.will_upload_video ? "Yes" : "No"}
                </p>
                <p>
                  <span className="font-semibold">Will Upload Audio:</span>{" "}
                  {selectedRequest.will_upload_audio ? "Yes" : "No"}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog> */}
    </div>
  );
}
