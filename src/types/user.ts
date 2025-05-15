export const UserRoles = ["admin", "user", "writer"] as const;
export type UserRole = (typeof UserRoles)[number];

export const AuthProviders = ["email", "google"] as const;
export type AuthProvider = (typeof AuthProviders)[number];

export const Genders = ["male", "female", "unspecified"] as const;
export type Gender = (typeof Genders)[number];

// Add the following types after the existing types

export const SocialPlatforms = [
  "Twitter / X",
  "Facebook",
  "Youtube",
  "Instagram",
  "LinkedIn",
  "TikTok",
  "Medium",
  "Website",
] as const;

export type SocialPlatform = (typeof SocialPlatforms)[number];

export interface WriterRequest {
  id: string;
  user_id: string;
  brand_name: string;
  social_media: Partial<Record<SocialPlatform, string>>;
  is_major_publisher: boolean;
  is_freelance: boolean;
  will_upload_video: boolean;
  will_upload_audio: boolean;
  status: "pending" | "approved" | "rejected";
  created_at: Date;
}

export interface IUser {
  id: string;
  email: string;
  has_email_verified: boolean;
  role: UserRole;
  username: string;
  auth_provider: AuthProvider;
  birth_date: Date | null;
  display_name: string;
  gender: Gender;
  avatar: string | null;
  profile_banner: string | null;
  is_disabled: boolean;
  last_login_at: Date;
  has_password: boolean;
  is_creator: boolean;
  location: string;
  ip_address: string;
  bio: string | null;
  created_at: Date;
  updated_at: Date;
}

export const mockUsers: IUser[] = [
  {
    id: "1",
    email: "sarah.wilson@example.com",
    has_email_verified: true,
    role: "admin",
    username: "sarahw",
    auth_provider: "email",
    birth_date: new Date("1990-01-01"),
    display_name: "Sarah Wilson",
    gender: "female",
    avatar: "/placeholder.svg?height=40&width=40",
    profile_banner: null,
    is_disabled: false,
    last_login_at: new Date(),
    has_password: true,
    is_creator: false,
    location: "New York, USA",
    ip_address: "192.168.1.1",
    bio: "Senior Administrator",
    created_at: new Date("2023-01-15"),
    updated_at: new Date("2024-01-15"),
  },
  {
    id: "2",
    email: "james.smith@example.com",
    has_email_verified: true,
    role: "writer",
    username: "jsmith",
    auth_provider: "google",
    birth_date: new Date("1988-05-15"),
    display_name: "James Smith",
    gender: "male",
    avatar: "/placeholder.svg?height=40&width=40",
    profile_banner: null,
    is_disabled: false,
    last_login_at: new Date(),
    has_password: false,
    is_creator: true,
    location: "London, UK",
    ip_address: "192.168.1.2",
    bio: "Content Creator",
    created_at: new Date("2023-02-20"),
    updated_at: new Date("2024-01-10"),
  },
  // Add more mock users as needed
];

// Add mock data for writer requests
export const mockWriterRequests: WriterRequest[] = [
  {
    id: "wr1",
    user_id: "2",
    brand_name: "Tech Insights",
    social_media: {
      "Twitter / X": "https://twitter.com/techinsights",
      LinkedIn: "https://linkedin.com/company/techinsights",
      Website: "https://techinsights.com",
    },
    is_major_publisher: false,
    is_freelance: true,
    will_upload_video: true,
    will_upload_audio: false,
    status: "pending",
    created_at: new Date("2024-03-01"),
  },
  {
    id: "wr2",
    user_id: "3",
    brand_name: "Fitness Journey",
    social_media: {
      Instagram: "https://instagram.com/fitnessjourney",
      Youtube: "https://youtube.com/fitnessjourney",
      TikTok: "https://tiktok.com/@fitnessjourney",
    },
    is_major_publisher: false,
    is_freelance: true,
    will_upload_video: true,
    will_upload_audio: true,
    status: "pending",
    created_at: new Date("2024-03-05"),
  },
];
