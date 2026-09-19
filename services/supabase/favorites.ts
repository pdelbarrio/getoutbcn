import { supabase } from "./client";
import { Favorite, Spot } from "./types";

const SPOT_LIST_FIELDS =
  "id, name, image_url, category, district, latitude, longitude";

export const favoritesService = {
  async getByUserId(userId: string): Promise<Favorite[]> {
    const { data, error } = await supabase
      .from("favorites")
      .select("id, user_id, spot_id, created_at")
      .eq("user_id", userId);
    if (error) throw error;
    return (data || []) as unknown as Favorite[];
  },

  async getSpotsByUserId(
    userId: string,
    from: number,
    to: number,
  ): Promise<{ data: Spot[]; count: number | null }> {
    const { data, error, count } = await supabase
      .from("favorites")
      .select(`spot_id, spots (${SPOT_LIST_FIELDS})`, { count: "exact" })
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(from, to);
    if (error) throw error;
    const spots = (data || [])
      .flatMap((f) => (Array.isArray(f.spots) ? f.spots : [f.spots]))
      .filter((s): s is never => !!s);
    return { data: spots as unknown as Spot[], count };
  },

  async getFavoriteSpotIds(userId: string): Promise<Set<string>> {
    const { data, error } = await supabase
      .from("favorites")
      .select("spot_id")
      .eq("user_id", userId);
    if (error) throw error;
    return new Set((data || []).map((f) => f.spot_id));
  },

  async add(spotId: string): Promise<Favorite> {
    const { data, error } = await supabase
      .from("favorites")
      .insert({ spot_id: spotId })
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  async toggleFavorite(spotId: string): Promise<"added" | "removed"> {
    const { data, error } = await supabase.rpc("toggle_favorite", {
      p_spot_id: spotId,
    });
    if (error) throw error;
    return data as "added" | "removed";
  },

  async remove(userId: string, spotId: string): Promise<void> {
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", userId)
      .eq("spot_id", spotId);
    if (error) throw error;
  },

  async isFavorite(userId: string, spotId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_id", userId)
      .eq("spot_id", spotId)
      .maybeSingle();
    if (error) throw error;
    return !!data;
  },
};
