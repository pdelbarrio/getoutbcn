import { supabase } from "./client";
import { Comment } from "./types";

export const commentsService = {
  async getBySpotId(spotId: string): Promise<Comment[]> {
    const { data, error } = await supabase.rpc("get_comments_for_spot", {
      p_spot_id: spotId,
    });
    if (error) throw error;
    return (data || []) as unknown as Comment[];
  },

  async create(spotId: string, content: string): Promise<Comment> {
    const { data, error } = await supabase
      .from("comments")
      .insert({ spot_id: spotId, content })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(commentId: string, content: string): Promise<Comment> {
    const { data, error } = await supabase
      .from("comments")
      .update({ content })
      .eq("id", commentId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async remove(commentId: string): Promise<void> {
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);
    if (error) throw error;
  },
};