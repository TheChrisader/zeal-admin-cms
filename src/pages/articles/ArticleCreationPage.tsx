import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiClient } from "@/lib/apiClient";
import { CATEGORIES } from "@/constants/categories";
import { useNavigate } from "react-router-dom";

const languages = ["English", "French"];
const countries = ["Nigeria"];

function extractDomain(url: string): string {
  const urlObj = new URL(url);

  const domainParts = urlObj.hostname.split(".");

  // Return the second-to-last part (e.g., "google" from "www.google.com")
  const result =
    domainParts.length > 1
      ? domainParts[domainParts.length - 2]
      : domainParts[0];
  return result as string;
}

function extractHostname(url: string): string {
  const urlObj = new URL(url);

  const hostname = urlObj.hostname;

  return hostname;
}

const ArticleCreationPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    link: "",
    description: "",
    content: "",
    author: "",
    category: "",
    language: "",
    country: "",
    keywords: [] as string[],
    image: null as File | null,
    imagePreview: "",
    topFeature: false,
    source_name: "",
    source_url: "",
    source_icon: "",
    source_id: "",
  });
  const [isLoading, setIsLoading] = useState({
    autoFill: false,
    createArticle: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [isFilled, setIsFilled] = useState(false);

  const [textContent, setTextContent] = useState("");
  // const [textNodePositions, setTextNodePositions] = useState<
  //   Array<{ start: number; end: number; parent: string }>
  // >([]);

  const [urlInput, setUrlInput] = useState("");
  const [currentKeyword, setCurrentKeyword] = useState("");

  const fetchArticleData = async (url: string) => {
    setIsLoading({ ...isLoading, autoFill: true });
    const response = await apiClient(`/api/v1/post/parse`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    });

    const article = await response.json();

    setIsLoading({ ...isLoading, autoFill: false });

    return {
      title: article.title,
      description: article.excerpt,
      author: article.byline ? article.byline : "",
      link: url,
      content: article.content,
      source_id: extractDomain(url),
      source_name: article.siteName || extractDomain(url),
      source_url: `https://${extractHostname(url)}`,
      source_icon: `https://www.google.com/s2/favicons?domain=${extractHostname(
        url
      )}&sz=64`,
    };
  };

  const handleUrlSubmit = async () => {
    try {
      const data = await fetchArticleData(urlInput);
      setFormData((prev) => ({
        ...prev,
        ...data,
      }));
      setUrlInput("");
      setIsFilled(true);
    } catch (error) {
      console.error("Error fetching article data:", error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file),
      }));
    }
  };

  const addKeyword = () => {
    if (currentKeyword && !formData.keywords.includes(currentKeyword)) {
      setFormData((prev) => ({
        ...prev,
        keywords: [...prev.keywords, currentKeyword],
      }));
      setCurrentKeyword("");
    }
  };

  const removeKeyword = (keyword: string) => {
    setFormData((prev) => ({
      ...prev,
      keywords: prev.keywords.filter((k) => k !== keyword),
    }));
  };

  const parseHtmlAndExtractText = (htmlString: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");
    let extractedText = "";
    const positions: Array<{ start: number; end: number; parent: string }> = [];

    function traverse(node: Node, parentTag: string = "") {
      if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
        const start = extractedText.length;
        const text = node.textContent.trim();
        extractedText += text + "\n";
        positions.push({
          start,
          end: start + text.length,
          parent: parentTag,
        });
      }

      node.childNodes.forEach((child) => {
        traverse(child, (node as Element).tagName || parentTag);
      });
    }

    traverse(doc.body);
    return { text: extractedText.trim(), positions };
  };

  const updateHtmlWithNewText = (newText: string) => {
    const lines = newText.split("\n");
    const parser = new DOMParser();
    const doc = parser.parseFromString(formData.content, "text/html");
    let currentLineIndex = 0;

    function traverse(node: Node) {
      if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
        if (currentLineIndex < lines.length) {
          node.textContent = node.textContent.replace(
            node.textContent.trim(),
            lines[currentLineIndex]
          );
          currentLineIndex++;
        } else {
          node.textContent = "";
        }
      }

      node.childNodes.forEach(traverse);
    }

    traverse(doc.body);
    return doc.body.innerHTML;
  };

  useEffect(() => {
    const { text } = parseHtmlAndExtractText(formData.content);
    setTextContent(text);
    // setTextNodePositions(positions);
  }, [formData.content]);

  const handleEditorChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setTextContent(newText);
    const updatedHtml = updateHtmlWithNewText(newText);
    setFormData((prev) => ({
      ...prev,
      content: updatedHtml,
    }));
    // setHtml(updatedHtml);
  };

  const checkFormValues = () => {
    if (!formData.title) {
      setError("Please enter a title.");
      return false;
    } else if (!formData.link) {
      setError("Please enter a link.");
      return false;
    } else if (!formData.description) {
      setError("Please enter a description.");
      return false;
    } else if (!formData.content) {
      setError("Please enter content.");
      return false;
    } else if (!formData.author) {
      setError("Please enter an author.");
      return false;
    } else if (!formData.category) {
      setError("Please select a category.");
      return false;
    } else if (!formData.language) {
      setError("Please select a language.");
      return false;
    } else if (!formData.country) {
      setError("Please select a country.");
      return false;
    } else if (!formData.keywords.length) {
      setError("Please enter at least one keyword.");
      return false;
    } else {
      setError(null);
      return true;
    }
  };

  const handleCreateArticle = async () => {
    const hasNoErrors = checkFormValues();
    if (!hasNoErrors) return;

    setIsLoading({ ...isLoading, createArticle: true });
    try {
      const articleFormData = new FormData();
      articleFormData.append("title", formData.title);
      articleFormData.append("description", formData.description);
      articleFormData.append("author", formData.author);
      articleFormData.append("link", formData.link);
      articleFormData.append("content", formData.content);
      articleFormData.append("keywords", formData.keywords.join());
      articleFormData.append("country", formData.country);
      articleFormData.append("language", formData.language);
      articleFormData.append("category", formData.category);
      articleFormData.append("topFeature", String(formData.topFeature));
      articleFormData.append("source_name", formData.source_name);
      articleFormData.append("source_url", formData.source_url);
      articleFormData.append("source_icon", formData.source_icon);
      articleFormData.append("source_id", formData.source_id);
      if (formData.image) {
        articleFormData.append("image", formData.image);
      }
      const response = await apiClient("/api/v1/admin/post", {
        method: "POST",
        // headers: {
        //   "Content-Type": "multipart/form-data",
        // },
        body: articleFormData,
      });

      const id = await response.json();
      navigate(`/articles/${id}`);
    } catch (error) {
      setError("Error creating article");
      console.error("Error creating article:", error);
    } finally {
      setIsLoading({ ...isLoading, createArticle: false });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Tabs defaultValue="create">
        <TabsList>
          <TabsTrigger value="create">Create</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Create Article</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* URL Auto-fill Section */}
              <div className="flex gap-4">
                <Input
                  placeholder="Paste article URL to auto-fill"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                />
                <Button onClick={handleUrlSubmit}>
                  {isLoading.autoFill ? "Loading..." : "Auto-fill"}
                </Button>
              </div>

              {/* Main Form */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    disabled={!isFilled}
                  />
                </div>

                <div>
                  <Label htmlFor="links">Link</Label>
                  <Input
                    id="links"
                    value={formData.link}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        link: e.target.value,
                      }))
                    }
                    disabled={!isFilled}
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    disabled={!isFilled}
                  />
                </div>

                <div>
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    className="h-64"
                    value={textContent}
                    onChange={handleEditorChange}
                    disabled={!isFilled}
                    // onChange={(e) =>
                    //   setFormData((prev) => ({
                    //     ...prev,
                    //     content: e.target.value,
                    //   }))
                    // }
                  />
                </div>

                <div>
                  <Label htmlFor="author">Author</Label>
                  <Input
                    id="author"
                    value={formData.author}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        author: e.target.value,
                      }))
                    }
                    disabled={!isFilled}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, category: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Language</Label>
                    <Select
                      value={formData.language}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, language: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map((language) => (
                          <SelectItem key={language} value={language}>
                            {language}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Country</Label>
                    <Select
                      value={formData.country}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, country: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Keywords</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={currentKeyword}
                      onChange={(e) => setCurrentKeyword(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addKeyword()}
                      placeholder="Add keyword and press Enter"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.keywords.map((keyword) => (
                      <Badge
                        key={keyword}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {keyword}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => removeKeyword(keyword)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Image</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  {formData.imagePreview && (
                    <div className="mt-2">
                      <img
                        src={formData.imagePreview}
                        alt="Preview"
                        className="max-w-xs rounded-lg"
                      />
                    </div>
                  )}
                </div>

                {formData.category === "Headlines" && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="headline"
                      checked={formData.topFeature}
                      onCheckedChange={(checked: boolean) =>
                        setFormData((prev) => ({
                          ...prev,
                          topFeature: checked as boolean,
                        }))
                      }
                    />
                    <Label htmlFor="headline">Feature at top</Label>
                  </div>
                )}

                {error && (
                  <div className="w-full flex items-center justify-center">
                    <span className="text-sm font-medium text-red-500">
                      {error}
                    </span>
                  </div>
                )}
                <Button className="w-full" onClick={handleCreateArticle}>
                  {isLoading.createArticle ? "Loading..." : "Create Article"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview">
          {formData.content ? (
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-extrabold text-[#2F2D32]">
                {formData.title}
              </h1>
              <div
                className="rounded-[20px] p-1 [&_a]:text-blue-500 [&_figcaption]:text-center [&_figcaption]:text-sm [&_figcaption]:font-bold [&_figure>img]:mb-2 [&_figure>img]:mt-4 [&_figure>img]:max-h-[350px] [&_figure>img]:rounded-md [&_figure>p]:text-black [&_figure]:mb-7 [&_figure]:flex [&_figure]:w-full [&_figure]:flex-col [&_figure]:items-center [&_img]:mx-auto [&_img]:block [&_img]:max-h-[350px] [&_img]:w-1/2 [&_img]:rounded-md [&_img]:object-cover [&_img]:object-center [&_p]:mb-4 [&_p]:max-w-[100vw] [&_p]:text-base [&_p]:font-normal [&_p]:text-[#696969]"
                dangerouslySetInnerHTML={{ __html: formData.content }}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center">
              {/* No Preview Available */}
              <p>No preview available.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ArticleCreationPage;
