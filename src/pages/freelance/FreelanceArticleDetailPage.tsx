import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import { toast } from "sonner";
import { IDraft } from "@/types/draft";
import HTMLParserRenderer from "@/components/custom/ArticleDisplay";

// const fetchPost = async (id: string): Promise<IDraft> => {
//   const response = await apiClient(`/api/v1/admin/bulk/freelance/posts/${id}`);
//   return response;
// };

const FreelanceArticleDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [moderationNotes, setModerationNotes] = useState<string[]>([]);
  const [newNote, setNewNote] = useState("");

  const fetchPost = async (id: string): Promise<IDraft> => {
    const response = await apiClient(
      `/api/v1/admin/bulk/freelance/posts/${id}`
    );
    setModerationNotes(response.moderationNotes);
    return response;
  };

  const { data: article, isLoading } = useQuery({
    queryKey: ["freelanceArticle", id],
    queryFn: () => fetchPost(id as string),
  });

  const approveMutation = useMutation({
    mutationFn: async () => {
      await apiClient(`/api/v1/admin/bulk/freelance/posts/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ moderationStatus: "published" }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["freelanceArticle", id] });
      toast.success("Article approved successfully!");
      navigate("/moderation/freelance/posts");
    },
    onError: (error: Error) => {
      toast.error(`Failed to approve article: ${error.message}`);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (notes: string[]) => {
      await apiClient(`/api/v1/admin/bulk/freelance/posts/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          moderationStatus: "rejected",
          moderationNotes: notes,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["freelanceArticle", id] });
      toast.success("Article rejected with feedback.");
      navigate("/moderation/freelance/posts");
    },
    onError: (error: Error) => {
      toast.error(`Failed to reject article: ${error.message}`);
    },
  });

  const handleAddNote = () => {
    if (newNote.trim()) {
      setModerationNotes([...moderationNotes, newNote.trim()]);
      setNewNote("");
    }
  };

  const handleRemoveNote = (index: number) => {
    setModerationNotes(moderationNotes.filter((_, i) => i !== index));
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!article) {
    return <div>Article not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
      </div>

      <div className="space-y-4">
        {article.user_name && (
          <div className="text-gray-500 text-sm">
            Author: {article.user_name}
          </div>
        )}
        <Card>
          <CardContent className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {article.title}
            </h1>
            <div className="prose prose-stone dark:prose-invert max-w-none">
              <div className="rounded-[20px] p-1 [&_a]:text-blue-500 [&_figcaption]:text-center [&_figcaption]:text-sm [&_figcaption]:font-bold [&_figure>img]:mb-2 [&_figure>img]:mt-4 [&_figure>img]:max-h-[350px] [&_figure>img]:rounded-md [&_figure>p]:text-black [&_figure]:mb-7 [&_figure]:flex [&_figure]:w-full [&_figure]:flex-col [&_figure]:items-center [&_img]:mx-auto [&_img]:block [&_img]:max-h-[350px] [&_img]:w-1/2 [&_img]:rounded-md [&_img]:object-cover [&_img]:object-center [&_p]:mb-4 [&_p]:max-w-[100vw] [&_p]:text-base [&_p]:font-normal [&_p]:text-[#696969]">
                <HTMLParserRenderer
                  htmlString={`<img
          src="${article.image_url}"
          alt="${article.title}"
        />
        ${article.content}`}
                />{" "}
              </div>{" "}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl font-semibold text-gray-800">
              Article Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
                Preview
              </h3>
              <p className="text-gray-700 leading-relaxed bg-white p-4 rounded-lg border border-gray-200">
                {article.description || "No preview available"}
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {article.keywords && article.keywords.length > 0 ? (
                  article.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500 text-white shadow-sm"
                    >
                      {keyword}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500 text-sm italic">
                    No tags available
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
                Categories
              </h3>
              <div className="flex flex-wrap gap-2">
                {article.category && article.category.length > 0 ? (
                  article.category.map((cat, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500 text-white shadow-sm"
                    >
                      {cat}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500 text-sm italic">
                    No categories available
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Corrections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Input
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a correction note..."
              />
              <Button onClick={handleAddNote}>Add Note</Button>
            </div>
            {moderationNotes.length > 0 && (
              <ul className="space-y-2">
                {moderationNotes.map((note, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between bg-gray-100 p-2 rounded"
                  >
                    <span>{note}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveNote(index)}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => approveMutation.mutate()}
                disabled={approveMutation.isPending}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" /> Approve
              </Button>
              <Button
                variant="destructive"
                className="w-full justify-start"
                onClick={() => rejectMutation.mutate(moderationNotes)}
                disabled={
                  rejectMutation.isPending || moderationNotes.length === 0
                }
              >
                <XCircle className="h-4 w-4 mr-2" /> Reject
              </Button>
            </div>
            <span className="text-xs text-destructive">
              * Please be sure to add at least one correction before rejecting.
            </span>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FreelanceArticleDetailPage;
