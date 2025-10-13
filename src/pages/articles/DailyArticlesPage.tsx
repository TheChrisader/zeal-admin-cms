import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Copy,
  ExternalLink,
  MoreVertical,
  Download,
  ChevronLeft,
  ChevronRight,
  Check,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/apiClient";
import useLocalStorage from "@/hooks/useLocalStorage";

interface Article {
  _id: string;
  title: string;
  slug: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

interface ApiResponse {
  status: string;
  data: {
    posts: Article[];
    pagination: Pagination;
  };
}

const fetchDailyArticles = async (
  page: number,
  limit: number,
  processed: number
): Promise<ApiResponse> => {
  const response = await apiClient(
    `/api/v1/admin/bulk/daily-articles?page=${page}&limit=${limit}&processed=${processed}`
  );
  return response;
};

interface BulkApiResponse {
  status: string;
  data: {
    posts: Article[];
    total: number;
  };
}

const fetchAllDailyArticles = async (
  processed: number
): Promise<BulkApiResponse> => {
  const response = await apiClient(`/api/v1/admin/bulk/daily-articles/dump`);
  return response;
};

const markArticleAsProcessed = async (id: string) => {
  const formData = new FormData();
  formData.append("has_been_processed", "true");

  await apiClient(`/api/v1/admin/bulk/posts/${id}`, {
    method: "PUT",
    body: formData,
  });
};

const markArticlesAsProcessed = async (ids: string[]) => {
  if (!ids.length) return;
  await apiClient(`/api/v1/admin/bulk/posts`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ids,
      updateData: { has_been_processed: true },
    }),
  });
};

const DailyArticlesPage = () => {
  const queryClient = useQueryClient();

  const [selectedArticles, setSelectedArticles] = useState<Set<string>>(
    new Set()
  );
  const [removedArticles, setRemovedArticles] = useLocalStorage<
    Record<string, string[]>
  >(`removed-articles-${format(new Date(), "yyyy-MM-dd")}`, {});
  const [page, setPage] = useState(1);
  const [limit] = useState(10); // Fixed limit as per API spec
  const [isProcessed, setIsProcessed] = useState(false); // false for unprocessed (0), true for processed (1)
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [processingArticles, setProcessingArticles] = useState<Set<string>>(
    new Set()
  );

  const today = format(new Date(), "yyyy-MM-dd");
  const [removedArticlesForToday, setRemovedArticlesForToday] = useState<
    string[]
  >(removedArticles[today] || []);

  // Reset page when filter changes
  useEffect(() => {
    setPage(1);
  }, [isProcessed]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["dailyArticles", page, isProcessed],
    queryFn: () => fetchDailyArticles(page, limit, isProcessed ? 1 : 0),
  });

  // Mutations
  const processMutation = useMutation({
    mutationFn: markArticlesAsProcessed,
    onSuccess: async (_, ids) => {
      await queryClient.invalidateQueries({
        queryKey: ["dailyArticles", page, isProcessed],
        refetchType: "all",
      });
      setSelectedArticles(new Set());
      toast.success(`${ids.length} article(s) marked as processed`);
    },
    onError: (error) => {
      console.error("Failed to mark articles as processed:", error);
      toast.error("Failed to mark articles as processed");
    },
  });

  const processSingleMutation = useMutation({
    mutationFn: markArticleAsProcessed,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["dailyArticles", page, isProcessed],
        refetchType: "all",
      });
      toast.success("Article marked as processed");
    },
    onError: (error) => {
      console.error("Failed to mark article as processed:", error);
      toast.error("Failed to mark article as processed");
    },
  });

  const articles = useMemo(() => data?.data?.posts || [], [data?.data?.posts]);
  const pagination = data?.data?.pagination;

  // Filter out removed articles (only for unprocessed articles)
  const visibleArticles = useMemo(() => {
    if (isProcessed) {
      return articles;
    }
    return articles.filter(
      (article) => !removedArticles[today]?.includes(article._id)
    );
  }, [articles, isProcessed, removedArticles, today]);
  console.log(data);

  // Clear localStorage if date changed
  useEffect(() => {
    const savedDate = Object.keys(removedArticles).find((key) => key === today);
    if (!savedDate) {
      setRemovedArticles({});
      setRemovedArticlesForToday([]);
    }
  }, [today]);

  // Sync removed articles with article list on load
  useEffect(() => {
    if (articles.length > Infinity) {
      // Filter out any removed article IDs that don't exist in current articles list
      const validRemovedIds = removedArticles[today].filter(
        (removedId: string) =>
          articles.some((article) => article._id === removedId)
      );

      if (validRemovedIds.length !== removedArticlesForToday.length) {
        setRemovedArticlesForToday(validRemovedIds);
        setRemovedArticles({
          ...removedArticles,
          [today]: validRemovedIds,
        });
      }
    }
  }, [
    articles,
    removedArticlesForToday,
    removedArticles,
    setRemovedArticles,
    setRemovedArticlesForToday,
    today,
  ]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedArticles(
        new Set(visibleArticles.map((article) => article._id))
      );
    } else {
      setSelectedArticles(new Set());
    }
  };

  const handleSelectArticle = (articleId: string, checked: boolean) => {
    const newSelected = new Set(selectedArticles);
    if (checked) {
      newSelected.add(articleId);
    } else {
      newSelected.delete(articleId);
    }
    setSelectedArticles(newSelected);
  };

  const handleCopyAllAsCSV = async () => {
    try {
      const bulkData = await fetchAllDailyArticles(isProcessed ? 1 : 0);
      const allArticlesData = bulkData.data.posts;

      if (allArticlesData.length === 0) {
        toast.error("No articles to export");
        return;
      }

      const csvContent = [
        ["Title", "URL"],
        ...allArticlesData.map((article) => [
          `"${article.title.replace(/"/g, '""')}"`,
          `https://zealnews.africa/en/post/${article.slug}`,
        ]),
      ]
        .map((row) => row.join(","))
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `daily-articles-${today}-all.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`CSV with ${allArticlesData.length} articles downloaded`);
    } catch (error) {
      console.error("Failed to export all articles:", error);
      toast.error("Failed to export all articles");
    }
  };

  const handleCopyAllAsJSON = async () => {
    try {
      const bulkData = await fetchAllDailyArticles(isProcessed ? 1 : 0);
      const allArticlesData = bulkData.data.posts;

      if (allArticlesData.length === 0) {
        toast.error("No articles to export");
        return;
      }

      const jsonData = allArticlesData.map((article) => ({
        title: article.title,
        url: `https://zealnews.africa/en/post/${article.slug}`,
      }));

      const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `daily-articles-${today}-all.json`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`JSON with ${allArticlesData.length} articles downloaded`);
    } catch (error) {
      console.error("Failed to export all articles:", error);
      toast.error("Failed to export all articles");
    }
  };

  const handleCopySelectedAsCSV = () => {
    const selectedOnly = visibleArticles.filter((article) =>
      selectedArticles.has(article._id)
    );

    if (selectedOnly.length === 0) {
      toast.error("No articles selected to export");
      return;
    }

    const csvContent = [
      ["Title", "URL"],
      ...selectedOnly.map((article) => [
        `"${article.title.replace(/"/g, '""')}"`,
        `https://zealnews.africa/en/post/${article.slug}`,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `daily-articles-${today}-selected.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(
      `CSV with ${selectedOnly.length} selected articles downloaded`
    );
  };

  const handleCopySelectedAsJSON = () => {
    const selectedOnly = visibleArticles.filter((article) =>
      selectedArticles.has(article._id)
    );

    if (selectedOnly.length === 0) {
      toast.error("No articles selected to export");
      return;
    }

    const jsonData = selectedOnly.map((article) => ({
      title: article.title,
      url: `https://zealnews.africa/en/post/${article.slug}`,
    }));

    const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `daily-articles-${today}-selected.json`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(
      `JSON with ${selectedOnly.length} selected articles downloaded`
    );
  };

  const handleCopyTitle = (title: string) => {
    navigator.clipboard.writeText(title);
    toast.success("Title copied to clipboard");
  };

  const handleCopyUrl = (slug: string) => {
    const url = `https://zealnews.africa/en/post/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success("URL copied to clipboard");
  };

  const handleOpenUrl = (slug: string) => {
    const url = `https://zealnews.africa/en/post/${slug}`;
    window.open(url, "_blank");
  };

  const handleMarkAsProcessed = async (ids: string | string[]) => {
    await processMutation.mutateAsync(Array.isArray(ids) ? ids : [ids]);
  };

  const handleMarkSingleAsProcessed = async (id: string) => {
    setProcessingArticles((prev) => new Set(prev).add(id));
    try {
      await processSingleMutation.mutateAsync(id);
    } finally {
      setProcessingArticles((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="text-red-500 text-lg font-medium">
          Error loading articles
        </div>
        <p className="text-muted-foreground mt-2">Please try again later</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Daily Articles</h1>
          <p className="text-muted-foreground mt-1">
            {isProcessed ? "Processed" : "Unprocessed"} articles created on{" "}
            {format(new Date(), "MMMM d, yyyy")}
          </p>
          <div className="flex items-center space-x-2 mt-2">
            <Switch
              id="processed-toggle"
              checked={isProcessed}
              onCheckedChange={setIsProcessed}
            />
            <label htmlFor="processed-toggle" className="text-sm font-medium">
              Show processed articles
            </label>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export All
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleCopyAllAsCSV}>
                Export All as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCopyAllAsJSON}>
                Export All as JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {!isProcessed && (
            <Button
              variant="default"
              onClick={async () =>
                await handleMarkAsProcessed(
                  selectedArticles.size > 0
                    ? Array.from(selectedArticles)
                    : visibleArticles.map((a) => a._id)
                )
              }
              disabled={
                visibleArticles.length === 0 || processMutation.isPending
              }
            >
              {processMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Check className="mr-2 h-4 w-4" />
              )}
              Mark all as processed
            </Button>
          )}
        </div>
      </div>

      {selectedArticles.size > 0 && (
        <div className="bg-muted p-3 rounded-md flex items-center justify-between">
          <span>{selectedArticles.size} article(s) selected</span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopySelectedAsCSV}
            >
              Export Selected (CSV)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopySelectedAsJSON}
            >
              Export Selected (JSON)
            </Button>
            {!isProcessed && (
              <Button
                variant="default"
                size="sm"
                onClick={async () =>
                  await handleMarkAsProcessed(Array.from(selectedArticles))
                }
                disabled={processMutation.isPending}
              >
                {processMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Check className="mr-2 h-4 w-4" />
                )}
                Mark as Processed
              </Button>
            )}
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Articles</CardTitle>
          <CardDescription>
            {isProcessed
              ? `${pagination?.total || 0} processed articles`
              : `${
                  (pagination?.total || 0) -
                  (removedArticles[today]?.length || 0)
                } ready for processing`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : (pagination?.total || 0) -
              (removedArticles[today]?.length || 0) ===
            0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-muted-foreground text-center">
                <p className="text-lg">No articles left for the day</p>
                <p className="mt-2">Check back later for new articles</p>
              </div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={
                          selectedArticles.size === visibleArticles.length
                        }
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead className="w-24">Copy Title</TableHead>
                    <TableHead className="w-24">Copy URL</TableHead>
                    <TableHead className="w-24">Open Link</TableHead>
                    {!isProcessed && (
                      <TableHead className="w-24">Process</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleArticles.map((article) => (
                    <TableRow key={article._id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedArticles.has(article._id)}
                          onCheckedChange={(checked) =>
                            handleSelectArticle(article._id, checked as boolean)
                          }
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span className="line-clamp-1">{article.title}</span>
                          <Link
                            to={`/articles/${article._id}`}
                            className="text-sm text-muted-foreground hover:underline mt-1"
                          >
                            View details
                          </Link>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleCopyTitle(article.title)}
                          className="h-8 px-2"
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          Title
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleCopyUrl(article.slug)}
                          className="h-8 px-2"
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          URL
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenUrl(article.slug)}
                          className="h-8 px-2"
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          {/* Open */}
                        </Button>
                      </TableCell>
                      {!isProcessed && (
                        <TableCell>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() =>
                              handleMarkSingleAsProcessed(article._id)
                            }
                            disabled={processingArticles.has(article._id)}
                            className="h-8 px-2"
                          >
                            {processingArticles.has(article._id) ? (
                              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            ) : (
                              <Check className="h-4 w-4 mr-1" />
                            )}
                            Process
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination Controls */}
              {pagination && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Page {pagination.page} of {pagination.totalPages}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                      disabled={pagination.page <= 1}
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((prev) => prev + 1)}
                      disabled={!pagination.hasMore}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DailyArticlesPage;
