import { useState } from "react";
import { Link } from "react-router-dom";
import { apiClient } from "@/lib/apiClient";
import { useUrlState } from "@/hooks/useUrlState";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { IDraft } from "@/types/draft";
import { useQuery } from "@tanstack/react-query";
import useDebouncedCallback from "@/hooks/useDebouncedCallback";

interface PostsResponse {
  posts: IDraft[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

const FreelanceArticlesListPage = () => {
  const [filters, setFilters] = useUrlState<{
    page: number;
    limit: number;
    search?: string;
  }>("filters", {
    defaultState: {
      page: 1,
      limit: 10,
      search: "",
    },
  });

  const [inputValue, setInputValue] = useState(filters.search || "");

  const { page, limit } = filters;

  const fetchPosts = async (params: any): Promise<PostsResponse> => {
    const searchParams = new URLSearchParams();

    // Build query params
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach((v) => searchParams.append(key, v));
        } else {
          searchParams.append(key, String(value));
        }
      }
    });

    try {
      const response = await apiClient(
        `/api/v1/admin/bulk/freelance/posts?${searchParams.toString()}`
      );

      if (!response) {
        return {
          posts: [],
          pagination: {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 0,
            hasMore: false,
          },
        };
      }

      return response;
    } catch (error) {
      console.error("Error fetching articles:", error);
      return {
        posts: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasMore: false,
        },
      };
    }
  };

  const { data, isLoading } = useQuery({
    queryKey: ["freelanceArticles", filters],
    queryFn: () => fetchPosts(filters),
  });

  const { posts = [], pagination } = data || {};
  const totalPages = pagination?.totalPages || 0;
  const totalItems = pagination?.total || 0;

  const handleSearch = () => {
    setFilters((prev) => ({
      ...prev,
      search: inputValue.trim() || undefined,
      page: 1,
    }));
  };

  const debouncedHandleSearch = useDebouncedCallback(handleSearch, 500);

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Freelance Articles</h1>
        <p className="text-muted-foreground mt-1">
          Manage and moderate freelance submissions
        </p>
      </div>

      {/* Search Bar */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Search articles..."
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              debouncedHandleSearch();
            }}
          />
        </div>
        <div className="flex items-center">
          <label htmlFor="limit" className="mr-2 whitespace-nowrap">
            Items per page:
          </label>
          <select
            id="limit"
            value={limit}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                limit: Number(e.target.value),
                page: 1,
              }))
            }
            className="p-2 border rounded"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div>
      </div>

      {/* Articles Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="w-full">
              {[1, 2, 3, 4, 5].map((row) => (
                <div
                  key={row}
                  className="flex items-center justify-between w-full gap-4 py-4 px-4 border-b"
                >
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-9 w-16" />
                </div>
              ))}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posts?.map((article: IDraft) => (
                    <TableRow key={article.id}>
                      <TableCell className="font-medium max-w-xs truncate">
                        {article.title}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            article.moderationStatus === "published"
                              ? "bg-green-100 text-green-800"
                              : article.moderationStatus === "awaiting_approval"
                              ? "bg-yellow-100 text-yellow-800"
                              : article.moderationStatus === "rejected"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {article.moderationStatus}
                        </span>
                      </TableCell>
                      <TableCell>
                        {new Date(article.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link
                          to={`/moderation/freelance/posts/${article.id}`}
                          className="text-blue-500 hover:underline"
                        >
                          View
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                  {posts?.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No freelance articles found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col items-center justify-between p-4 border-t">
                  <div className="text-sm text-muted-foreground mb-4">
                    Showing {(page - 1) * limit + 1} to{" "}
                    {Math.min(page * limit, totalItems)} of {totalItems}{" "}
                    articles
                  </div>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            if (page <= 1) return;
                            e.preventDefault();
                            setFilters((prev) => ({ ...prev, page: page - 1 }));
                          }}
                          className={
                            page <= 1
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }
                        />
                      </PaginationItem>

                      {/* Show first page */}
                      {page > 2 && (
                        <>
                          <PaginationItem>
                            <PaginationLink
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                setFilters((prev) => ({ ...prev, page: 1 }));
                              }}
                            >
                              1
                            </PaginationLink>
                          </PaginationItem>
                          {page > 3 && (
                            <PaginationItem>
                              <span className="px-3 py-2 text-muted-foreground">
                                ...
                              </span>
                            </PaginationItem>
                          )}
                        </>
                      )}

                      {/* Show previous page */}
                      {page > 1 && (
                        <PaginationItem>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setFilters((prev) => ({
                                ...prev,
                                page: page - 1,
                              }));
                            }}
                          >
                            {page - 1}
                          </PaginationLink>
                        </PaginationItem>
                      )}

                      {/* Show current page */}
                      <PaginationItem>
                        <PaginationLink
                          href="#"
                          isActive
                          onClick={(e) => {
                            e.preventDefault();
                          }}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>

                      {/* Show next page */}
                      {page < totalPages && (
                        <PaginationItem>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setFilters((prev) => ({
                                ...prev,
                                page: page + 1,
                              }));
                            }}
                          >
                            {page + 1}
                          </PaginationLink>
                        </PaginationItem>
                      )}

                      {/* Show last page */}
                      {page < totalPages - 1 && (
                        <>
                          {page < totalPages - 2 && (
                            <PaginationItem>
                              <span className="px-3 py-2 text-muted-foreground">
                                ...
                              </span>
                            </PaginationItem>
                          )}
                          <PaginationItem>
                            <PaginationLink
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                setFilters((prev) => ({
                                  ...prev,
                                  page: totalPages,
                                }));
                              }}
                            >
                              {totalPages}
                            </PaginationLink>
                          </PaginationItem>
                        </>
                      )}

                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            if (page >= totalPages) return;
                            e.preventDefault();
                            setFilters((prev) => ({ ...prev, page: page + 1 }));
                          }}
                          className={
                            page >= totalPages
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FreelanceArticlesListPage;
