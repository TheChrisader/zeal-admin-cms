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

      console.log(response);

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
                    <TableHead>Author</TableHead>
                    <TableHead>Category</TableHead>
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
                      <TableCell className="font-medium">
                        {article.display_name || 'Unknown'}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {article.category && article.category.length > 0 ? (
                            article.category.map((cat, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md"
                              >
                                {cat}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-500 text-sm">No category</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(article.created_at).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link
                          to={`/moderation/freelance/posts/${article.id}`}
                          className="inline-flex items-center px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors duration-200"
                        >
                          View
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                  {posts?.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
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
