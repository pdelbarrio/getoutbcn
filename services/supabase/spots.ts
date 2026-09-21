import { supabase } from "./client";
import { Spot } from "./types";
import { calculateDistance } from "../../utils/geolocation";

const SPOT_LIST_FIELDS =
  "id, name, image_url, category, district, latitude, longitude";
const SPOT_DETAIL_FIELDS =
  "id, name, description, image_url, website, category, district, latitude, longitude, tags, address";
const MAP_SPOT_FIELDS = "id, name, category, latitude, longitude";

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

  async getByCategory(
    category: string,
    from: number,
    to: number,
  ): Promise<{ data: Spot[]; count: number | null }> {
    const tag = category.toLowerCase();
    const { data, error, count } = await supabase
      .from("spots")
      .select(SPOT_LIST_FIELDS, { count: "exact" })
      .or(`category.eq.${category},tags.cs.{"${tag}"}`)
      .order("created_at", { ascending: false })
      .range(from, to);
    if (error) throw error;
    return { data: (data || []) as unknown as Spot[], count };
  },

  async getByDistrict(
    district: string,
    from: number,
    to: number,
  ): Promise<{ data: Spot[]; count: number | null }> {
    const { data, error, count } = await supabase
      .from("spots")
      .select(SPOT_LIST_FIELDS, { count: "exact" })
      .eq("district", district)
      .order("created_at", { ascending: false })
      .range(from, to);
    if (error) throw error;
    return { data: (data || []) as unknown as Spot[], count };
  },

  async getByTag(
    tag: string,
    from: number,
    to: number,
  ): Promise<{ data: Spot[]; count: number | null }> {
    const { data, error, count } = await supabase
      .from("spots")
      .select(SPOT_LIST_FIELDS, { count: "exact" })
      .contains("tags", [tag])
      .order("created_at", { ascending: false })
      .range(from, to);
    if (error) throw error;
    return { data: (data || []) as unknown as Spot[], count };
  },

  async getByCategoryAndDistrict(
    category: string,
    district: string,
    from: number,
    to: number,
  ): Promise<{ data: Spot[]; count: number | null }> {
    const tag = category.toLowerCase();
    const { data, error, count } = await supabase
      .from("spots")
      .select(SPOT_LIST_FIELDS, { count: "exact" })
      .eq("district", district)
      .or(`category.eq.${category},tags.cs.{"${tag}"}`)
      .order("created_at", { ascending: false })
      .range(from, to);
    if (error) throw error;
    return { data: (data || []) as unknown as Spot[], count };
  },

  async getAllForMap(): Promise<Spot[]> {
    const { data, error } = await supabase
      .from("spots")
      .select(MAP_SPOT_FIELDS)
      .neq("district", "No district");
    if (error) throw error;
    return ((data || []) as unknown as Spot[]).filter(
      (spot) => spot.latitude !== 0 && spot.longitude !== 0,
    );
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