import { supabase } from "./client";
import { Profile } from "./types";

export const profilesService = {
  async create(profile: Omit<Profile, "created_at">): Promise<Profile> {
    const { data, error } = await supabase
      .from("profiles")
      .insert(profile)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getById(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (error) throw error;
    return (data as unknown as Profile) || null;
  },

  async updateUsername(userId: string, username: string): Promise<Profile> {
    const { data, error } = await supabase
      .from("profiles")
      .update({ username })
      .eq("id", userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};
