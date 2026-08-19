import { supabase } from "./client";
import { Spot } from "./types";

export const spotsService = {
  async getAll(): Promise<Spot[]> {
    const { data, error } = await supabase.from("spots").select("*");
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Spot | null> {
    const { data, error } = await supabase
      .from("spots")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  },

  async getByCategory(category: string): Promise<Spot[]> {
    const [catResults, tagResults] = await Promise.all([
      supabase
        .from("spots")
        .select("*")
        .eq("category", category),
      supabase
        .from("spots")
        .select("*")
        .contains("tags", [category.toLowerCase()]),
    ]);
    if (catResults.error) throw catResults.error;
    if (tagResults.error) throw tagResults.error;
    const map = new Map<string, Spot>();
    for (const spot of [...(catResults.data || []), ...(tagResults.data || [])]) {
      map.set(spot.id, spot);
    }
    return Array.from(map.values());
  },

  async getByDistrict(district: string): Promise<Spot[]> {
    const { data, error } = await supabase
      .from("spots")
      .select("*")
      .eq("district", district);
    if (error) throw error;
    return data || [];
  },

  async getByTag(tag: string): Promise<Spot[]> {
    const { data, error } = await supabase
      .from("spots")
      .select("*")
      .contains("tags", [tag]);
    if (error) throw error;
    return data || [];
  },

  async getByCategoryAndDistrict(
    category: string,
    district: string,
  ): Promise<Spot[]> {
    const [catResults, tagResults] = await Promise.all([
      supabase
        .from("spots")
        .select("*")
        .eq("category", category)
        .eq("district", district),
      supabase
        .from("spots")
        .select("*")
        .contains("tags", [category.toLowerCase()])
        .eq("district", district),
    ]);
    if (catResults.error) throw catResults.error;
    if (tagResults.error) throw tagResults.error;
    const map = new Map<string, Spot>();
    for (const spot of [...(catResults.data || []), ...(tagResults.data || [])]) {
      map.set(spot.id, spot);
    }
    return Array.from(map.values());
  },

  async getRandom(): Promise<Spot | null> {
    const { data, error } = await supabase.from("spots").select("*");
    if (error) throw error;
    if (!data || data.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * data.length);
    return data[randomIndex];
  },

  async create(spot: Omit<Spot, "id" | "created_at">): Promise<Spot> {
    const { data, error } = await supabase
      .from("spots")
      .insert(spot)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};
