type Id = string; // mongoose.Types.ObjectId, so be sure to call toHexString

export interface IDraft {
  _id?: Id;
  id: Id | string;
  user_id: Id | string;
  title: string;
  content: string;
  description: string;
  image_url: string | null;
  image_key?: string;
  image_metadata?: {
    x: number;
    y: number;
    scale: number;
    objectFit: "contain" | "cover" | "fill";
  };
  video_url: string | null;
  keywords: string[];
  country: string[];
  category: string[];
  moderationStatus: "draft" | "awaiting_approval" | "published" | "rejected";
  moderationNotes: string[];
  published: boolean;
  created_at: string;
  updated_at: string;
}
