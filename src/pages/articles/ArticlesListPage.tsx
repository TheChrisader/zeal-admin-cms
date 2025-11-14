import React, { useEffect } from "react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge, BadgeProps } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Plus,
  MoreVertical,
  Trash2,
  Edit,
  Eye,
  Filter,
  Download,
  AlertCircle,
} from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import { Skeleton } from "@/components/ui/skeleton";
import { CATEGORIES } from "@/constants/categories";
import { useUrlState } from "@/hooks/useUrlState";
import useDebouncedCallback from "@/hooks/useDebouncedCallback";
import useIsFirstRender from "@/hooks/useIsFirstRender";

interface PostsParams {
  page: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
  search?: string;
  category?: string;
  language?: string;
  country?: string;
  fromDate?: string;
  toDate?: string;
  author?: string;
  published?: boolean;
  generatedBy?: "user" | "zeal" | "auto";
}

interface PostsResponse {
  status: string;
  data: {
    posts: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasMore: boolean;
    };
  };
}

const fetchPosts = async (
  params: PostsParams
): Promise<PostsResponse["data"]> => {
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

  const response = await apiClient(
    `/api/v1/admin/bulk/posts?${searchParams.toString()}`
  );
  // if (!response.ok) {
  //   throw new Error("Network response was not ok");
  // }
  const data = response.data;
  const { posts, pagination } = data;
  return { posts, pagination };
};

// const deletePost = async (id: number) => {
//   await fetch(`http://localhost:3000/api/v1/admin/bulk/posts/${id}`, {
//     method: "DELETE",
//   });
// };

const deleteArticles = async (ids: number[]) => {
  if (!ids.length) return;
  await apiClient(`/api/v1/admin/bulk/posts`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ids }),
  });
};

// const deleteFunction = async (ids: number | number[]) => {
//   if (Array.isArray(ids)) {
//     await deletePosts(ids);
//   } else {
//     await deletePost(ids);
//   }
// }

const ArticlesListPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const isFirstRender = useIsFirstRender();

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

  // State
  const [selectedArticles, setSelectedArticles] = useState<Set<number>>(
    new Set()
  );
  const [filters, setFilters] = useUrlState("filters", {
    defaultState: {
      page: 1,
      limit: 10,
      // status: "all",
      search: "",
      // generatedBy: "all" as string | undefined,
      // category: undefined as string | undefined,
      // language: "all" as string | undefined,
      // country: "all" as string | undefined,
      // fromDate: "",
      // toDate: "",
    },
  });
  const [inputValue, setInputValue] = useState(filters.search || "");
  // const [filters, setFilters] = useState<PostsParams>({
  //   page: 1,
  //   limit: 10,
  //   // status: "all",
  //   search: "",
  // });

  // Queries
  const { data, isLoading }: any = useQuery({
    queryKey: ["articles", filters],
    queryFn: () => fetchPosts(filters),
  });
  // console.log(data);
  // let articlesData = [];
  const { posts: articlesData, pagination } = data || {};

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: deleteArticles,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["articles", filters],
        refetchType: "all",
      });
      setSelectedArticles(new Set());
    },
  });

  // Handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedArticles(new Set(articlesData?.map((article) => article._id)));
    } else {
      setSelectedArticles(new Set());
    }
  };

  const handleSelectArticle = (articleId: number, checked: boolean) => {
    const newSelected = new Set(selectedArticles);
    if (checked) {
      newSelected.add(articleId);
    } else {
      newSelected.delete(articleId);
    }
    setSelectedArticles(newSelected);
  };

  const handleDelete = async (ids: number | number[]) => {
    await deleteMutation.mutateAsync(Array.isArray(ids) ? ids : [ids]);
  };

  const handleSearch = () => {
    let page = filters.page;

    if (!isFirstRender) {
      page = 1;
    }

    setFilters((prev) => ({ ...prev, search: inputValue.trim(), page }));
  };

  const handleInput = (value: string) => {
    setInputValue(value);
  };

  const debouncedHandleSearch = useDebouncedCallback(handleSearch, 800);

  useEffect(debouncedHandleSearch, [inputValue]);
  useEffect(() => console.log(filters), [filters]);

  const getStatusBadge = (
    status: "Published" | "Draft" | "Under Review" | "Flagged"
  ) => {
    const variants = {
      Published: "default",
      Draft: "secondary",
      "Under Review": "destructive",
      Flagged: "destructive",
    };
    return (
      <Badge variant={variants[status] as BadgeProps["variant"]}>
        {status}
      </Badge>
    );
  };

  // if (isLoading)
  //   return (
  //     <div className="space-y-6">
  //       {/* Header */}
  //       <div className="flex items-center justify-between">
  //         <Skeleton className="h-16 w-64" />
  //         <div className="flex gap-3">
  //           {/* <Skeleton className="h-10 w-32" /> */}
  //           <Skeleton className="h-10 w-44" />
  //         </div>
  //       </div>

  //       {/* Search and Filter */}
  //       <div className="flex items-center justify-between gap-4">
  //         <Skeleton className="h-16 flex-1 w-full" />
  //         {/* <Skeleton className="h-10 w-40" /> */}
  //       </div>

  //       {/* Table Header */}
  //       <div className="grid grid-cols-5 gap-4 py-3 px-4 bg-muted/50 rounded-lg">
  //         <Skeleton className="h-5 w-16" />
  //         <Skeleton className="h-5 w-24" />
  //         <Skeleton className="h-5 w-16" />
  //         <Skeleton className="h-5 w-28" />
  //         <Skeleton className="h-5 w-24" />
  //       </div>

  //       {/* Table Rows */}
  //       {[1, 2, 3].map((row) => (
  //         <div
  //           key={row}
  //           className="grid grid-cols-5 gap-4 py-4 px-4 items-center border-b"
  //         >
  //           {/* User Column */}
  //           <div className="flex items-center gap-3">
  //             <Skeleton className="h-10 w-10 rounded-full" />
  //             <div className="space-y-2">
  //               <Skeleton className="h-4 w-24" />
  //               <Skeleton className="h-3 w-16" />
  //             </div>
  //           </div>
  //           {/* Email Column */}
  //           <Skeleton className="h-4 w-48" />
  //           {/* Role Column */}
  //           <Skeleton className="h-6 w-16 rounded-full" />
  //           {/* Created At Column */}
  //           <Skeleton className="h-4 w-24" />
  //           {/* Actions Column */}
  //           <div className="flex gap-2">
  //             <Skeleton className="h-9 w-16" />
  //             <Skeleton className="h-9 w-16" />
  //           </div>
  //         </div>
  //       ))}
  //     </div>
  //   );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Articles</h1>
          <p className="text-muted-foreground mt-1">
            Manage and monitor all articles
          </p>
        </div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <Button onClick={() => navigate("/articles/new")}>
            <Plus className="mr-2 h-4 w-4" /> New Article
          </Button>
        </motion.div>
      </motion.div>

      {/* Filters */}
      {/* <Card>
        <CardContent className="p-4 space-y-4"> */}
      <motion.div variants={itemVariants} className="space-y-4">
        <motion.div
          variants={itemVariants}
          className="flex flex-wrap gap-4"
        >
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Search articles..."
              value={inputValue}
              onChange={(e) => handleInput(e.target.value)}
            />
          </div>
          <Select
            value={filters.category}
            onValueChange={(value) => {
              const newGeneratedValue = value === "all" ? undefined : value;
              setFilters((prev) => ({
                ...prev,
                category: newGeneratedValue,
                page: 1,
              }));
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filters.generatedBy}
            onValueChange={(value) => {
              const newGeneratedValue =
                value === "all" ? undefined : (value as "user" | "auto");
              setFilters((prev) => ({
                ...prev,
                generatedBy: newGeneratedValue,
                page: 1,
              }));
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Generated By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="auto">Auto</SelectItem>
            </SelectContent>
          </Select>
          {/* <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" /> More Filters
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" /> Export
            </Button> */}
        </motion.div>

        {selectedArticles.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="flex items-center justify-between bg-muted/50 p-2 rounded"
          >
            <span>{selectedArticles.size} articles selected</span>
            <div className="space-x-2">
              <Button variant="outline" size="sm">
                Change Status
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={async () =>
                  await handleDelete(Array.from(selectedArticles))
                }
              >
                Delete Selected
              </Button>
            </div>
          </motion.div>
        )}
      </motion.div>
      {/* </CardContent>
      </Card> */}

      {/* Articles Table */}
      <motion.div
        variants={itemVariants}
        whileHover={{
          y: -2,
          boxShadow:
            "0 10px 25px -5px rgba(99, 102, 241, 0.1), 0 10px 10px -5px rgba(99, 102, 241, 0.04)",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="w-full overflow-auto">
              {[1, 2, 3, 4, 5].map((row) => (
                <div
                  key={row}
                  className="flex justify-between w-full gap-4 py-4 px-4 items-center border-b"
                >
                  {/* User Column */}
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      {/* <Skeleton className="h-3 w-16" /> */}
                    </div>
                  </div>
                  {/* Email Column */}
                  <Skeleton className="h-4 w-48" />
                  {/* Role Column */}
                  {/* <Skeleton className="h-6 w-16 rounded-full" /> */}
                  {/* Created At Column */}
                  <Skeleton className="h-4 w-24" />
                  {/* Actions Column */}
                  <div className="flex gap-2">
                    <Skeleton className="h-9 w-16" />
                    <Skeleton className="h-9 w-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedArticles.size === articlesData?.length}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Category</TableHead>
                    {/* <TableHead>Status</TableHead> */}
                    <TableHead>Published</TableHead>
                    {/* <TableHead>Views</TableHead> */}
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {articlesData?.map((article) => (
                    <TableRow key={article._id.toString()}>
                      <TableCell>
                        <Checkbox
                          checked={selectedArticles.has(article._id)}
                          onCheckedChange={(checked) =>
                            handleSelectArticle(article._id, checked as boolean)
                          }
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center text-indigo-800/80">
                          {article.title}
                          {article.flags > 0 && (
                            <Badge variant="destructive" className="ml-2">
                              {article.flags} flags
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {article.source.name || article.author_id}
                      </TableCell>
                      <TableCell>{article.category}</TableCell>
                      {/* <TableCell>
                    {getStatusBadge(
                      article.status as
                        | "Published"
                        | "Draft"
                        | "Under Review"
                        | "Flagged"
                    )}
                  </TableCell> */}
                      <TableCell>
                        {new Date(article.published_at).toLocaleDateString()}
                      </TableCell>
                      {/* <TableCell>{article.views?.toLocaleString()}</TableCell> */}
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                navigate(`/articles/${article._id}`)
                              }
                            >
                              <Eye className="mr-2 h-4 w-4" /> View
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                navigate(`/articles/${article._id}/edit`)
                              }
                            >
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={async () =>
                                await handleDelete(article._id)
                              }
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex flex-col items-center justify-between p-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Showing {(filters.page - 1) * filters.limit + 1} to{" "}
                  {Math.min(
                    filters.page * filters.limit,
                    pagination?.total || 0
                  )}{" "}
                  of {pagination?.total || 0} articles
                </div>
                <Pagination>
                  <PaginationContent className="w-full flex items-center justify-between">
                    <PaginationItem>
                      <PaginationPrevious
                        className="cursor-pointer"
                        onClick={() => {
                          if (filters.page === 1) return;
                          setFilters((prev) => ({
                            ...prev,
                            page: prev.page - 1,
                          }));
                        }}
                      />
                    </PaginationItem>
                    {/* {Array.from({
                  length: pagination.totalPages || 0,
                }).map((_, i) => (
                  <PaginationItem key={i + 1}>
                    <PaginationLink
                      isActive={filters.page === i + 1}
                      onClick={() =>
                        setFilters((prev) => ({ ...prev, page: i + 1 }))
                      }
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))} */}
                    <PaginationItem>
                      <PaginationNext
                        className="cursor-pointer"
                        onClick={() => {
                          if (!pagination.hasMore) return;
                          setFilters((prev) => ({
                            ...prev,
                            page: prev.page + 1,
                          }));
                        }}
                        // disabled={filters.page === articlesData?.meta?.totalPages}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      </motion.div>
    </motion.div>
  );
};

export default ArticlesListPage;
