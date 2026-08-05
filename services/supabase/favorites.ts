import { supabase } from "./client";
import { Favorite } from "./types";

export const favoritesService = {
  async getByUserId(userId: string): Promise<Favorite[]> {
    const { data, error } = await supabase
      .from("favorites")
      .select("*")
      .eq("user_id", userId);
    if (error) throw error;
    return data || [];
  },

  async add(userId: string, spotId: string): Promise<Favorite> {
    const { data, error } = await supabase
      .from("favorites")
      .insert({ user_id: userId, spot_id: spotId })
      .select()
      .single();
    if (error) throw error;
    return data;
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
      .single();
    return !!data && !error;
  },
};
