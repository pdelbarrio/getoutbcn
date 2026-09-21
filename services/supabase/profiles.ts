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
};
