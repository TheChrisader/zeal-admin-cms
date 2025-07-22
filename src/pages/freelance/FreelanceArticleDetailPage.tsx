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
        <Card>
          <CardContent className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {article.title}
            </h1>
            <div
              className="prose prose-stone dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{
                __html: article.content,
              }}
            />
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
