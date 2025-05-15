import React from "react";
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { Badge, BadgeProps } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Eye,
  Save,
  ArrowLeft,
  Clock,
  Flag,
  MessageSquare,
  ThumbsUp,
  Share2,
  AlertTriangle,
  CheckCircle2,
  History,
  XCircle,
} from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import { CATEGORIES } from "@/constants/categories";
import { formatHTML } from "@/lib/html-formatter";
import { stripExtraWhitespace } from "@/utils/stripExtraWhitespace";
import RichTextEditor from "@/components/custom/editor";
import { toast } from "sonner";
import ImageUploadPreview from "@/components/custom/ImageUploadPreview";

const fetchPost = async (id: string): Promise<any> => {
  const response = await apiClient(`/api/v1/admin/bulk/posts/${id}`);

  if (!response.ok) {
    throw new Error("Network response was not ok");
  }

  const data = await response.json();

  return data.data;
};

const ArticleDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("edit");
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  // State for managing tags input
  const [tagInput, setTagInput] = useState("");
  // State for tracking unsaved changes
  const [unsavedChanges, setUnsavedChanges] = useState<any>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);

  // Queries
  const { data: article, isLoading } = useQuery({
    queryKey: ["article", id],
    queryFn: () => fetchPost(id as string),
  });

  // Initialize unsaved changes when article data is loaded
  React.useEffect(() => {
    if (article && !unsavedChanges) {
      setUnsavedChanges(article);
    }
  }, [article, unsavedChanges]);

  // Mutations
  const updateMutation = useMutation({
    mutationFn: async (updatedArticle: any) => {
      const formData = new FormData();

      // Append all simple fields
      Object.keys(updatedArticle).forEach((key) => {
        if (
          key !== "image_url" &&
          key !== "content" &&
          key !== "source" &&
          key !== "reactions" &&
          updatedArticle[key] !== undefined &&
          updatedArticle[key] !== null
        ) {
          if (Array.isArray(updatedArticle[key])) {
            updatedArticle[key].forEach((item: string) =>
              formData.append(key, item)
            );
          } else {
            formData.append(key, updatedArticle[key]);
          }
        }
      });

      // Handle content separately if it's complex or needs special formatting
      if (updatedArticle.content) {
        formData.append("content", updatedArticle.content);
      }

      // Handle image upload
      if (selectedImageFile) {
        formData.append("image", selectedImageFile);
      } else if (updatedArticle.image_url === null) {
        // Explicitly removing image
        formData.append("image_url", ""); // Send empty string or specific flag to backend to remove image
      }
      // If image_url is present and not null, and no new file, backend should keep existing image_url

      const response = await apiClient(`/api/v1/admin/bulk/posts/${id}`, {
        method: "PUT",
        // Content-Type will be set automatically by browser for FormData
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to update article");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["article", id] });
      toast.success("Article updated successfully!");
      setSelectedImageFile(null); // Reset selected file after successful upload
    },
    onError: (error: Error) => {
      toast.error(`Failed to update article: ${error.message}`);
    },
    onSettled: () => {
      // Potentially re-enable button or perform other cleanup
    },
  });

  // Function to save all changes at once
  const saveChanges = () => {
    if (unsavedChanges) {
      updateMutation.mutate(unsavedChanges);
    }
  };

  const getStatusBadge = (status: "active" | "flagged" | "removed") => {
    const variants = {
      active: "default",
      flagged: "secondary",
      removed: "destructive",
    };
    return (
      <Badge
        className="max-[1000px]:my-2  capitalize"
        variant={variants[status] as BadgeProps["variant"]}
      >
        {status}
      </Badge>
    );
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!unsavedChanges) return;
    setUnsavedChanges({ ...unsavedChanges, title: e.target.value });
  };

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    if (!unsavedChanges) return;
    setUnsavedChanges({ ...unsavedChanges, description: e.target.value });
  };

  const handleCategoryChange = (value: string) => {
    if (!unsavedChanges) return;
    // Check if category already exists in the array
    const currentCategories = [...(unsavedChanges.category || [])];
    if (currentCategories.includes(value)) {
      // Remove the category if it's already selected
      const updatedCategories = currentCategories.filter(
        (cat) => cat !== value
      );
      setUnsavedChanges({ ...unsavedChanges, category: updatedCategories });
    } else {
      // Add the category if it's not already selected
      setUnsavedChanges({
        ...unsavedChanges,
        category: [...currentCategories, value],
      });
    }
  };

  const handleRemoveCategory = (categoryToRemove: string) => {
    if (!unsavedChanges) return;
    const updatedCategories = (unsavedChanges.category || []).filter(
      (category: string) => category !== categoryToRemove
    );
    setUnsavedChanges({ ...unsavedChanges, category: updatedCategories });
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim() && unsavedChanges) {
      e.preventDefault();
      const newTags = [...(unsavedChanges.keywords || []), tagInput.trim()];
      setUnsavedChanges({ ...unsavedChanges, keywords: newTags });
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (!unsavedChanges) return;
    const newTags = (unsavedChanges.keywords || []).filter(
      (tag: string) => tag !== tagToRemove
    );
    setUnsavedChanges({ ...unsavedChanges, keywords: newTags });
  };

  const handleImageFileSelect = (file: File | null) => {
    setSelectedImageFile(file);
    if (file) {
      // If a new file is selected, we'll let the backend generate the new URL.
      // We can optimistically update the preview, but the actual image_url in unsavedChanges
      // should perhaps be cleared or handled based on backend logic.
      // For now, let's assume the preview is handled by ImageUploadPreview component itself.
      // We might not need to set image_url in unsavedChanges here if backend handles it.
    } else {
      // If file is null (e.g. image removed in preview), mark image_url as null in unsavedChanges
      setUnsavedChanges({ ...unsavedChanges, image_url: null });
    }
  };

  const handleImageReset = () => {
    setSelectedImageFile(null);
    // Reset image_url in unsavedChanges back to the original article's image_url
    setUnsavedChanges({
      ...unsavedChanges,
      image_url: article?.image_url || null,
    });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!article) {
    return <div>Article not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between max-[1000px]:flex-col max-[1000px]:items-start">
        <div className="flex items-center gap-4 max-[1000px]:flex-col max-[1000px]:items-start">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {unsavedChanges?.title || article?.title}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              {getStatusBadge(
                article.status as "active" | "flagged" | "removed"
              )}
              {/* <span className="text-sm text-muted-foreground">
                Last updated{" "}
                {new Date(
                  article.revisions[article.revisions.length - 1].date
                ).toLocaleDateString()}
              </span> */}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={isPreviewMode ? "default" : "outline"}
            onClick={() => setIsPreviewMode(!isPreviewMode)}
          >
            <Eye className="h-4 w-4 mr-2" />
            {isPreviewMode ? "Exit Preview" : "Preview"}
          </Button>
          <Button onClick={saveChanges} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" /> Save
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6 max-[1100px]:grid-cols-1">
        {/* Main Content */}
        <div className="col-span-3 space-y-6">
          {isPreviewMode ? (
            <Card>
              <CardContent className="p-6">
                <article className="prose prose-stone dark:prose-invert max-w-none">
                  {/* This would use a Markdown renderer in production */}
                  <div
                    className="rounded-[20px] p-1 [&_a]:text-blue-500 [&_figcaption]:text-center [&_figcaption]:text-sm [&_figcaption]:font-bold [&_figure>img]:mb-2 [&_figure>img]:mt-4 [&_figure>img]:max-h-[350px] [&_figure>img]:rounded-md [&_figure>p]:text-black [&_figure]:mb-7 [&_figure]:flex [&_figure]:w-full [&_figure]:flex-col [&_figure]:items-center [&_img]:mx-auto [&_img]:block [&_img]:max-h-[350px] [&_img]:w-1/2 [&_img]:rounded-md [&_img]:object-cover [&_img]:object-center [&_p]:mb-4 [&_p]:max-w-[100vw] [&_p]:text-base [&_p]:font-normal [&_p]:text-[#696969]"
                    dangerouslySetInnerHTML={{
                      __html: unsavedChanges?.content || article?.content || "",
                    }}
                  />
                </article>
              </CardContent>
            </Card>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="edit">Edit</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
                {/* <TabsTrigger value="history">History</TabsTrigger> */}
              </TabsList>

              <TabsContent value="edit" className="space-y-4">
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Title</label>
                      <Input
                        value={unsavedChanges?.title || article?.title}
                        onChange={handleTitleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Description</label>
                      <Textarea
                        value={
                          unsavedChanges?.description ||
                          article?.description ||
                          ""
                        }
                        onChange={handleDescriptionChange}
                        placeholder="Enter a short description for the article..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Article Content
                      </label>
                      <RichTextEditor
                        value={unsavedChanges?.content || article?.content}
                        onChange={(content) =>
                          setUnsavedChanges({ ...unsavedChanges, content })
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings">
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <div className="">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Categories
                        </label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              className="w-full justify-between"
                            >
                              {(
                                unsavedChanges?.category ||
                                article?.category ||
                                []
                              ).length > 0
                                ? `${
                                    (
                                      unsavedChanges?.category ||
                                      article?.category ||
                                      []
                                    ).length
                                  } selected`
                                : "Select categories"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0">
                            <Command>
                              <CommandInput placeholder="Search categories..." />
                              <CommandEmpty>No category found.</CommandEmpty>
                              <CommandGroup>
                                <CommandList>
                                  {CATEGORIES.map((category) => {
                                    const isSelected = (
                                      unsavedChanges?.category ||
                                      article?.category ||
                                      []
                                    ).includes(category);
                                    return (
                                      <CommandItem
                                        key={category}
                                        value={category}
                                        onSelect={() =>
                                          handleCategoryChange(category)
                                        }
                                      >
                                        <Check
                                          className={`mr-2 h-4 w-4 ${
                                            isSelected
                                              ? "opacity-100"
                                              : "opacity-0"
                                          }`}
                                        />
                                        {category}
                                      </CommandItem>
                                    );
                                  })}
                                </CommandList>
                              </CommandGroup>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {(
                            unsavedChanges?.category ||
                            article?.category ||
                            []
                          ).map((category: string) => (
                            <Badge
                              key={category}
                              variant="secondary"
                              className="flex items-center gap-1 px-3 py-1"
                            >
                              {category}
                              <button
                                onClick={() => handleRemoveCategory(category)}
                                className="ml-1 text-xs hover:text-destructive"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                      {/* <div className="space-y-2">
                        <label className="text-sm font-medium">Status</label>
                        <Select value={article.status}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Draft">Draft</SelectItem>
                            <SelectItem value="Under Review">
                              Under Review
                            </SelectItem>
                            <SelectItem value="Published">Published</SelectItem>
                          </SelectContent>
                        </Select>
                      </div> */}
                    </div>
                    <div className="space-y-2">
                      <ImageUploadPreview
                        currentImageUrl={
                          unsavedChanges?.image_url || article?.image_url
                        }
                        onFileSelect={handleImageFileSelect}
                        onReset={handleImageReset}
                        label="Thumbnail Image"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Tags</label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {(
                          unsavedChanges?.keywords ||
                          article?.keywords ||
                          []
                        ).map((tag: string) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="flex items-center gap-1 px-3 py-1"
                          >
                            {tag}
                            <button
                              onClick={() => handleRemoveTag(tag)}
                              className="ml-1 text-xs hover:text-destructive"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <Input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleAddTag}
                        placeholder="Add a tag and press Enter"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* <TabsContent value="history">
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {article.revisions.map((revision) => (
                        <div
                          key={revision.id}
                          className="flex items-start gap-4"
                        >
                          <div className="mt-1">
                            <History className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {revision.type.charAt(0).toUpperCase() +
                                revision.type.slice(1)}{" "}
                              by {revision.author}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(revision.date).toLocaleDateString()} at{" "}
                              {new Date(revision.date).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent> */}
            </Tabs>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats */}
          {/* <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Eye className="h-4 w-4 mr-1" /> Views
                  </div>
                  <p className="text-2xl font-bold">
                    {article.views.toLocaleString()}
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <ThumbsUp className="h-4 w-4 mr-1" /> Likes
                  </div>
                  <p className="text-2xl font-bold">
                    {article.likes.toLocaleString()}
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MessageSquare className="h-4 w-4 mr-1" /> Comments
                  </div>
                  <p className="text-2xl font-bold">
                    {article.comments.toLocaleString()}
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Share2 className="h-4 w-4 mr-1" /> Shares
                  </div>
                  <p className="text-2xl font-bold">24</p>
                </div>
              </div>
            </CardContent>
          </Card> */}

          {/* Moderation */}
          {/* {article.flags > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-destructive">
                  <Flag className="h-4 w-4 mr-2" /> Content Flags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Content has been flagged</AlertTitle>
                  <AlertDescription>
                    This article has received {article.flags} flags from users.
                    Review needed.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )} */}

          {/* Moderation Notes */}
          {/* <Card>
            <CardHeader>
              <CardTitle>Moderation Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[200px]">
                {{article.moderationNotes.map((note) => (
                  <div key={note.id} className="mb-4">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 mt-1" />
                      <div>
                        <p className="text-sm font-medium">{note.author}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(note.date).toLocaleDateString()}
                        </p>
                        <p className="mt-1">{note.note}</p>
                      </div>
                    </div>
                  </div>
                ))}}
              </ScrollArea>
              <div className="mt-4">
                <Textarea
                  placeholder="Add a moderation note..."
                  className="mb-2"
                />
                <Button className="w-full">Add Note</Button>
              </div>
            </CardContent>
          </Card> */}

          {/* Quick Actions */}
          <Card className="max-w-sm">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                disabled={article.status === "active"}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" /> Approve & Publish
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                disabled={article.status === "removed"}
                onClick={async () => {
                  await apiClient(`/api/v1/admin/articles/${article.id}`, {
                    method: "DELETE",
                  });
                  queryClient.invalidateQueries({ queryKey: ["article", id] });
                  navigate(-1);
                  toast.success("Article deleted!");
                }}
              >
                <XCircle className="h-4 w-4 mr-2" /> Reject & Delete
              </Button>
              {/* <Button
                variant="destructive"
                className="w-full justify-start"
                disabled={article.status === "flagged"}
              >
                <Flag className="h-4 w-4 mr-2" /> Mark as Inappropriate
              </Button> */}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetailPage;
