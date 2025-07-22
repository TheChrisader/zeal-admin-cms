import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/apiClient";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";

const fetchPost = async (id: string): Promise<any> => {
  const response = await apiClient(`/api/v1/admin/bulk/freelance/posts/${id}`);
  return response;
};

const FreelanceArticleViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: article, isLoading } = useQuery({
    queryKey: ["freelanceArticle", id],
    queryFn: () => fetchPost(id as string),
  });

  if (!id) {
    navigate("/moderation/freelance/posts/queue");
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!article) {
    return <div>Article not found</div>;
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex w-full items-center justify-end gap-3">
        <Button
          onClick={() => navigate(`/moderation/freelance/posts/${id}/edit`)}
        >
          Edit
        </Button>
      </div>
      <h1 className="text-2xl font-extrabold text-[#2F2D32]">
        {article.title}
      </h1>
      <div
        className="rounded-[20px] p-1 [&_a]:text-blue-500 [&_figcaption]:text-center [&_figcaption]:text-sm [&_figcaption]:font-bold [&_figure>img]:mb-2 [&_figure>img]:mt-4 [&_figure>img]:max-h-[350px] [&_figure>img]:rounded-md [&_figure>p]:text-black [&_figure]:mb-7 [&_figure]:flex [&_figure]:w-full [&_figure]:flex-col [&_figure]:items-center [&_img]:mx-auto [&_img]:block [&_img]:max-h-[350px] [&_img]:w-1/2 [&_img]:rounded-md [&_img]:object-cover [&_img]:object-center [&_p]:mb-4 [&_p]:max-w-[100vw] [&_p]:text-base [&_p]:font-normal [&_p]:text-[#696969]"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />
    </div>
  );
};

export default FreelanceArticleViewPage;
