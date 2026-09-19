import { supabase } from "./client";
import { Spot } from "./types";
import { calculateDistance } from "../../utils/geolocation";

const SPOT_LIST_FIELDS =
  "id, name, image_url, category, district, latitude, longitude";
const SPOT_DETAIL_FIELDS =
  "id, name, description, image_url, website, category, district, latitude, longitude, tags, address";

export const spotsService = {
  async getById(id: string): Promise<Spot | null> {
    const { data, error } = await supabase
      .from("spots")
      .select(SPOT_DETAIL_FIELDS)
      .eq("id", id)
      .single();
    if (error) throw error;
    return data as unknown as Spot | null;
  },

  async getByCategory(category: string): Promise<Spot[]> {
    const tag = category.toLowerCase();
    const { data, error } = await supabase
      .from("spots")
      .select(SPOT_LIST_FIELDS)
      .or(`category.eq.${category},tags.cs.{"${tag}"}`);
    if (error) throw error;
    return (data || []) as unknown as Spot[];
  },

  async getByDistrict(district: string): Promise<Spot[]> {
    const { data, error } = await supabase
      .from("spots")
      .select(SPOT_LIST_FIELDS)
      .eq("district", district);
    if (error) throw error;
    return (data || []) as unknown as Spot[];
  },

  async getByTag(tag: string): Promise<Spot[]> {
    const { data, error } = await supabase
      .from("spots")
      .select(SPOT_LIST_FIELDS)
      .contains("tags", [tag]);
    if (error) throw error;
    return (data || []) as unknown as Spot[];
  },

  async getByCategoryAndDistrict(
    category: string,
    district: string,
  ): Promise<Spot[]> {
    const tag = category.toLowerCase();
    const { data, error } = await supabase
      .from("spots")
      .select(SPOT_LIST_FIELDS)
      .eq("district", district)
      .or(`category.eq.${category},tags.cs.{"${tag}"}`);
    if (error) throw error;
    return (data || []) as unknown as Spot[];
  },

  async getRandom(): Promise<Spot | null> {
    const { data, error } = await supabase.rpc("get_random_spot").maybeSingle();
    if (error) throw error;
    return (data as unknown as Spot) || null;
  },

  async getNearest(
    lat: number,
    lon: number,
  ): Promise<{ spot: Spot; distance: number } | null> {
    const { data, error } = await supabase
      .rpc("get_nearest_spot", { user_lat: lat, user_lon: lon })
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    const spot = data as Spot;
    const distance = calculateDistance(lat, lon, spot.latitude, spot.longitude);
    return { spot, distance };
  },

  async getNearby(
    lat: number,
    lon: number,
    limit = 50,
  ): Promise<Spot[]> {
    const { data, error } = await supabase.rpc("get_nearby_spots", {
      user_lat: lat,
      user_lon: lon,
      max_results: limit,
    });
    if (error) throw error;
    return (data || []) as unknown as Spot[];
  },

  async create(
    spot: Omit<Spot, "id" | "created_at" | "created_by">,
  ): Promise<Spot> {
    const { data, error } = await supabase
      .from("spots")
      .insert(spot)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};