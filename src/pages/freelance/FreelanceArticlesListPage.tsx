import { useEffect, useState } from "react";
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
import { IDraft } from "@/types/draft";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const FreelanceArticlesListPage = () => {
  const queryClient = useQueryClient();
  const [articles, setArticles] = useState<IDraft[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFilters] = useUrlState<{
    page: number;
    limit: number;
  }>("filters", {
    defaultState: {
      page: 1,
      limit: 10,
    },
  });

  const { page, limit } = filters;

  const fetchPosts = async (params: any) => {
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
      // setArticles(response);
      // setTotalPages(response.totalPages);
      if (!response) return [];
      return response;
    } catch (error) {
      console.error("Error fetching articles:", error);
    }
  };

  const { data = [], isLoading }: any = useQuery({
    queryKey: ["articles", filters],
    queryFn: () => fetchPosts(filters),
  });

  console.log(data);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Freelance Articles</h1>
      <div className="mb-4">
        <label htmlFor="limit" className="mr-2">
          Items per page:
        </label>
        <select
          id="limit"
          value={limit}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, limit: Number(e.target.value) }))
          }
          className="p-2 border rounded"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
        </select>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            {/* <TableHead>Author</TableHead> */}
            <TableHead>Status</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.map((article: IDraft) => (
            <TableRow key={article.id}>
              <TableCell>{article.title}</TableCell>
              {/* <TableCell>{article.author.fullName}</TableCell> */}
              <TableCell>{article.moderationStatus}</TableCell>
              <TableCell>
                {new Date(article.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <Link
                  to={`/moderation/freelance/posts/${article.id}`}
                  className="text-blue-500 hover:underline"
                >
                  View
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
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
              className={page <= 1 ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
          {Array.from({ length: totalPages }, (_, i) => (
            <PaginationItem key={i}>
              <PaginationLink
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setFilters((prev) => ({ ...prev, page: i + 1 }));
                }}
                isActive={i + 1 === page}
              >
                {i + 1}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                if (page >= totalPages) return;
                e.preventDefault();
                setFilters((prev) => ({ ...prev, page: page + 1 }));
              }}
              className={
                page >= totalPages ? "pointer-events-none opacity-50" : ""
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default FreelanceArticlesListPage;
