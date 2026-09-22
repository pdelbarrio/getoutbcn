export type Spot = {
  id: string;
  name: string;
  description: string;
  image_url: string;
  website?: string;
  category: string;
  district: string;
  latitude: number;
  longitude: number;
  tags?: string[];
  address?: string;
  created_at: string;
  created_by: string;
};

export type Profile = {
  id: string;
  email: string;
  username?: string;
  avatar_url?: string;
  role?: "user" | "admin";
  created_at: string;
};

export type Comment = {
  id: string;
  spot_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  is_anonymous: boolean;
  username?: string | null;
  avatar_url?: string | null;
};
