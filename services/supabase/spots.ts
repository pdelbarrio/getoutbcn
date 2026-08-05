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
    const { data, error } = await supabase
      .from("spots")
      .select("*")
      .eq("category", category);
    if (error) throw error;
    return data || [];
  },

  async getByDistrict(district: string): Promise<Spot[]> {
    const { data, error } = await supabase
      .from("spots")
      .select("*")
      .eq("district", district);
    if (error) throw error;
    return data || [];
  },

  async getByCategoryAndDistrict(
    category: string,
    district: string,
  ): Promise<Spot[]> {
    const { data, error } = await supabase
      .from("spots")
      .select("*")
      .eq("category", category)
      .eq("district", district);
    if (error) throw error;
    return data || [];
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
