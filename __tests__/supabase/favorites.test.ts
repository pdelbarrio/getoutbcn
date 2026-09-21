import { favoritesService } from "../../services/supabase/favorites";
import { supabase } from "../../services/supabase/client";
import { setSupabaseMock, ok, fail } from "../helpers/supabaseQuery";

jest.mock("../../services/supabase/client");

const listSpot = (id: string) => ({
  id,
  name: `Spot ${id}`,
  image_url: `https://example.com/${id}.png`,
  category: "Bars",
  district: "Gràcia",
  latitude: 41.3869,
  longitude: 2.1521,
});

describe("favoritesService.getByUserId", () => {
  it("returns the user's favorite rows", async () => {
    const builder = setSupabaseMock(ok([favorite]));
    const result = await favoritesService.getByUserId("user-1");
    expect(result).toEqual([favorite]);
    expect(supabase.from).toHaveBeenCalledWith("favorites");
    expect(builder.select).toHaveBeenCalledWith(
      "id, user_id, spot_id, created_at",
    );
    expect(builder.eq).toHaveBeenCalledWith("user_id", "user-1");
  });

  it("returns an empty array when there are no favorites", async () => {
    setSupabaseMock(ok([]));
    await expect(favoritesService.getByUserId("user-1")).resolves.toEqual([]);
  });

  it("throws when supabase returns an error", async () => {
    setSupabaseMock(fail("boom"));
    await expect(favoritesService.getByUserId("user-1")).rejects.toThrow(
      "boom",
    );
  });
});

describe("favoritesService.getSpotsByUserId", () => {
  it("flattens the embedded spots and returns paginated data with count", async () => {
    const builder = setSupabaseMock(
      ok(
        [
          { spot_id: "a", spots: listSpot("a") },
          { spot_id: "b", spots: [listSpot("b"), listSpot("c")] },
          { spot_id: "d", spots: null },
        ],
        2,
      ),
    );
    const result = await favoritesService.getSpotsByUserId("user-1", 0, 14);
    expect(result).toEqual({
      data: [listSpot("a"), listSpot("b"), listSpot("c")],
      count: 2,
    });
    expect(supabase.from).toHaveBeenCalledWith("favorites");
    expect(builder.select).toHaveBeenCalledWith(
      `spot_id, spots (id, name, image_url, category, district, latitude, longitude)`,
      { count: "exact" },
    );
    expect(builder.eq).toHaveBeenCalledWith("user_id", "user-1");
    expect(builder.order).toHaveBeenCalledWith("created_at", {
      ascending: false,
    });
    expect(builder.range).toHaveBeenCalledWith(0, 14);
  });

  it("throws when supabase returns an error", async () => {
    setSupabaseMock(fail("boom"));
    await expect(
      favoritesService.getSpotsByUserId("user-1", 0, 14),
    ).rejects.toThrow("boom");
  });
});

describe("favoritesService.getFavoriteSpotIds", () => {
  it("returns a set of the user's spot ids", async () => {
    setSupabaseMock(ok([{ spot_id: "a" }, { spot_id: "b" }, { spot_id: "a" }]));
    const result = await favoritesService.getFavoriteSpotIds("user-1");
    expect(result).toEqual(new Set(["a", "b"]));
    expect(supabase.from).toHaveBeenCalledWith("favorites");
  });

  it("returns an empty set when there are no favorites", async () => {
    setSupabaseMock(ok([]));
    await expect(
      favoritesService.getFavoriteSpotIds("user-1"),
    ).resolves.toEqual(new Set());
  });

  it("throws when supabase returns an error", async () => {
    setSupabaseMock(fail("boom"));
    await expect(
      favoritesService.getFavoriteSpotIds("user-1"),
    ).rejects.toThrow("boom");
  });
});

describe("favoritesService.add", () => {
  it("inserts a favorite and returns the created row", async () => {
    const builder = setSupabaseMock(ok(favorite));
    const result = await favoritesService.add("spot-1");
    expect(result).toEqual(favorite);
    expect(supabase.from).toHaveBeenCalledWith("favorites");
    expect(builder.insert).toHaveBeenCalledWith({ spot_id: "spot-1" });
    expect(builder.single).toHaveBeenCalledTimes(1);
  });

  it("throws when supabase returns an error", async () => {
    setSupabaseMock(fail("boom"));
    await expect(favoritesService.add("spot-1")).rejects.toThrow("boom");
  });
});

describe("favoritesService.toggleFavorite", () => {
  it("returns the RPC result when the favorite was added", async () => {
    setSupabaseMock(ok("added"));
    const result = await favoritesService.toggleFavorite("spot-1");
    expect(result).toBe("added");
    expect(supabase.rpc).toHaveBeenCalledWith("toggle_favorite", {
      p_spot_id: "spot-1",
    });
  });

  it("returns the RPC result when the favorite was removed", async () => {
    setSupabaseMock(ok("removed"));
    await expect(favoritesService.toggleFavorite("spot-1")).resolves.toBe(
      "removed",
    );
  });

  it("throws when supabase returns an error", async () => {
    setSupabaseMock(fail("boom"));
    await expect(favoritesService.toggleFavorite("spot-1")).rejects.toThrow(
      "boom",
    );
  });
});

describe("favoritesService.remove", () => {
  it("deletes the specific favorite row", async () => {
    const builder = setSupabaseMock(ok(null));
    await favoritesService.remove("user-1", "spot-1");
    expect(supabase.from).toHaveBeenCalledWith("favorites");
    expect(builder.delete).toHaveBeenCalledTimes(1);
    expect(builder.eq).toHaveBeenCalledWith("user_id", "user-1");
    expect(builder.eq).toHaveBeenCalledWith("spot_id", "spot-1");
  });

  it("throws when supabase returns an error", async () => {
    setSupabaseMock(fail("boom"));
    await expect(favoritesService.remove("user-1", "spot-1")).rejects.toThrow(
      "boom",
    );
  });
});

describe("favoritesService.isFavorite", () => {
  it("returns true when the favorite exists", async () => {
    setSupabaseMock(ok({ id: "fav-1" }));
    await expect(
      favoritesService.isFavorite("user-1", "spot-1"),
    ).resolves.toBe(true);
  });

  it("returns false when the favorite does not exist", async () => {
    setSupabaseMock(ok(null));
    await expect(
      favoritesService.isFavorite("user-1", "spot-1"),
    ).resolves.toBe(false);
  });

  it("throws when supabase returns an error", async () => {
    setSupabaseMock(fail("boom"));
    await expect(
      favoritesService.isFavorite("user-1", "spot-1"),
    ).rejects.toThrow("boom");
  });
});