import { supabase } from "./client";
import { Spot } from "./types";

const SPOT_LIST_FIELDS =
  "id, name, image_url, category, district, latitude, longitude";

export const favoritesService = {
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

  async toggleFavorite(spotId: string): Promise<"added" | "removed"> {
    const { data, error } = await supabase.rpc("toggle_favorite", {
      p_spot_id: spotId,
    });
    if (error) throw error;
    return data as "added" | "removed";
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
