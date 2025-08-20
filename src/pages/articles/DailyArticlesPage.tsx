import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
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
  Trash2,
  Download,
  ChevronLeft,
  ChevronRight,
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
  limit: number
): Promise<ApiResponse> => {
  const response = await apiClient(
    `/api/v1/admin/bulk/daily-articles?page=${page}&limit=${limit}`
  );
  return response;
};

const DailyArticlesPage = () => {
  const [selectedArticles, setSelectedArticles] = useState<Set<string>>(
    new Set()
  );
  const [removedArticles, setRemovedArticles] = useLocalStorage<
    Record<string, string[]>
  >(`removed-articles-${format(new Date(), "yyyy-MM-dd")}`, {});
  const [page, setPage] = useState(1);
  const [limit] = useState(10); // Fixed limit as per API spec

  const today = format(new Date(), "yyyy-MM-dd");
  const [removedArticlesForToday, setRemovedArticlesForToday] = useState<
    string[]
  >(removedArticles[today] || []);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["dailyArticles", page],
    queryFn: () => fetchDailyArticles(page, limit),
  });

  const articles = data?.data?.posts || [];
  const pagination = data?.data?.pagination;

  // Filter out removed articles
  const visibleArticles = articles.filter(
    (article) => !removedArticles[today]?.includes(article._id)
  );
  console.log(removedArticles[today]);

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

  const handleRemoveArticle = (articleId: string) => {
    const newRemoved = [...removedArticlesForToday, articleId];
    setRemovedArticlesForToday(newRemoved);
    setRemovedArticles({
      ...removedArticles,
      [today]: newRemoved,
    });

    // Also remove from selected if it was selected
    if (selectedArticles.has(articleId)) {
      const newSelected = new Set(selectedArticles);
      newSelected.delete(articleId);
      setSelectedArticles(newSelected);
    }

    toast.success("Article removed from list");
  };

  const handleCopyAllAsCSV = () => {
    const selectedOrAll =
      selectedArticles.size > 0
        ? visibleArticles.filter((article) => selectedArticles.has(article._id))
        : visibleArticles;

    if (selectedOrAll.length === 0) {
      toast.error("No articles to export");
      return;
    }

    const csvContent = [
      ["Title", "URL"],
      ...selectedOrAll.map((article) => [
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
    link.setAttribute("download", `daily-articles-${today}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`CSV with ${selectedOrAll.length} articles downloaded`);
  };

  const handleCopyAllAsJSON = () => {
    const selectedOrAll =
      selectedArticles.size > 0
        ? visibleArticles.filter((article) => selectedArticles.has(article._id))
        : visibleArticles;

    if (selectedOrAll.length === 0) {
      toast.error("No articles to export");
      return;
    }

    const jsonData = selectedOrAll.map((article) => ({
      title: article.title,
      url: `https://zealnews.africa/en/post/${article.slug}`,
    }));

    const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `daily-articles-${today}.json`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`JSON with ${selectedOrAll.length} articles downloaded`);
  };

  const handleRemoveAll = () => {
    const selectedOrAll =
      selectedArticles.size > 0
        ? visibleArticles
            .filter((article) => selectedArticles.has(article._id))
            .map((a) => a._id)
        : visibleArticles.map((article) => article._id);

    if (selectedOrAll.length === 0) {
      toast.error("No articles to remove");
      return;
    }

    const newRemoved = [...removedArticlesForToday, ...selectedOrAll];
    setRemovedArticlesForToday(newRemoved);
    setRemovedArticles({
      ...removedArticles,
      [today]: newRemoved,
    });

    // Clear selection
    setSelectedArticles(new Set());

    toast.success(`${selectedOrAll.length} articles removed from list`);
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
            Articles created on {format(new Date(), "MMMM d, yyyy")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleCopyAllAsCSV}>
                Copy as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCopyAllAsJSON}>
                Copy as JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="destructive"
            onClick={handleRemoveAll}
            disabled={visibleArticles.length === 0}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Remove All
          </Button>
        </div>
      </div>

      {selectedArticles.size > 0 && (
        <div className="bg-muted p-3 rounded-md flex items-center justify-between">
          <span>{selectedArticles.size} article(s) selected</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCopyAllAsCSV}>
              Export Selected (CSV)
            </Button>
            <Button variant="outline" size="sm" onClick={handleCopyAllAsJSON}>
              Export Selected (JSON)
            </Button>
            <Button variant="destructive" size="sm" onClick={handleRemoveAll}>
              Remove Selected
            </Button>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Articles</CardTitle>
          <CardDescription>
            {(pagination?.total || 0) - (removedArticles[today]?.length || 0)}{" "}
            ready for processing
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
                    <TableHead className="w-24">Remove</TableHead>
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
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveArticle(article._id)}
                          className="h-8 px-2"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </TableCell>
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
