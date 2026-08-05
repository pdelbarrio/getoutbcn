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
  created_by: string;
  created_at: string;
};

export type Profile = {
  id: string;
  email: string;
  username?: string;
  avatar_url?: string;
  role?: "user" | "admin";
  created_at: string;
};

export type Favorite = {
  id: string;
  user_id: string;
  spot_id: string;
  created_at: string;
};

export type Category =
  | "Live Music"
  | "Food"
  | "Shops"
  | "Stand Up"
  | "Cinema"
  | "Views"
  | "Silence"
  | "Weird";

export type District =
  | "Ciutat Vella"
  | "Eixample"
  | "Sants-Montjuïc"
  | "Les Corts"
  | "Sarrià-Sant Gervasi"
  | "Gràcia"
  | "Horta-Guinardó"
  | "Nou Barris"
  | "Sant Andreu"
  | "Sant Martí"
  | "No district";
