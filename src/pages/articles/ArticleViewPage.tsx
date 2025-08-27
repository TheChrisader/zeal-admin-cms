import { useAuth } from "@/App";
import HTMLParserRenderer from "@/components/custom/ArticleDisplay";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/apiClient";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const fetchPost = async (id: string): Promise<any> => {
  const response = await apiClient(`/api/v1/admin/bulk/posts/${id}`);

  // if (!response.ok) {
  //   throw new Error("Network response was not ok");
  // }

  // const data = await response.json();

  return response.data;
};

// const broadcastPost = async (id: string) => {
//   const response = await apiClient(`/api/v1/admin/notifications/broadcast`, {
//     method: "POST",
//     body: JSON.stringify({ postId: id }),
//   });

//   if (!response.ok) {
//     throw new Error("Network response was not ok");
//   }
// }

const ArticleViewPage = () => {
  const [isLoadingBroadcast, setIsLoadingBroadcast] = useState(false);
  const { hasPermission } = useAuth();
  const { id } = useParams();
  // const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: article, isLoading } = useQuery({
    queryKey: ["article", id],
    queryFn: () => fetchPost(id as string),
  });

  if (!id) {
    navigate("/articles");
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!article) {
    return <div>Article not found</div>;
  }

  const broadcastPost = async (id: string) => {
    setIsLoadingBroadcast(true);
    await apiClient(`/api/v1/admin/notifications/broadcast`, {
      method: "POST",
      body: JSON.stringify({ postId: id }),
    });

    // if (!response.ok) {
    //   throw new Error("Network response was not ok");
    // }

    setIsLoadingBroadcast(false);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex w-full items-center justify-end gap-3">
        <Button onClick={() => navigate(`/articles/${id}/edit`)}>Edit</Button>
        {hasPermission("admin:all") && (
          <Button onClick={() => broadcastPost(id as string)}>
            {isLoadingBroadcast ? "Broadcasting..." : "Broadcast"}
          </Button>
        )}
      </div>
      <h1 className="text-2xl font-extrabold text-[#2F2D32]">
        {article.title}
      </h1>
      <div className="rounded-[20px] p-1 [&_a]:text-blue-500 [&_figcaption]:text-center [&_figcaption]:text-sm [&_figcaption]:font-bold [&_figure>img]:mb-2 [&_figure>img]:mt-4 [&_figure>img]:max-h-[350px] [&_figure>img]:rounded-md [&_figure>p]:text-black [&_figure]:mb-7 [&_figure]:flex [&_figure]:w-full [&_figure]:flex-col [&_figure]:items-center [&_img]:mx-auto [&_img]:block [&_img]:max-h-[350px] [&_img]:w-1/2 [&_img]:rounded-md [&_img]:object-cover [&_img]:object-center [&_p]:mb-4 [&_p]:max-w-[100vw] [&_p]:text-base [&_p]:font-normal [&_p]:text-[#696969]">
        <HTMLParserRenderer
          htmlString={`<img
          src="${article.image_url}"
          alt="${article.title}"
        />
        ${article.content}`}
        />{" "}
      </div>
    </div>
  );
};

export default ArticleViewPage;
