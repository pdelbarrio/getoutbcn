import { spotsService } from "../../services/supabase/spots";
import { supabase } from "../../services/supabase/client";
import { setSupabaseMock, ok, fail } from "../helpers/supabaseQuery";

jest.mock("../../services/supabase/client");

const detailSpot = {
  id: "spot-1",
  name: "El Pona",
  description: "Cervesa i música en directe",
  image_url: "https://example.com/pona.png",
  website: "https://elpona.example",
  category: "Bars",
  district: "Gràcia",
  latitude: 41.3869,
  longitude: 2.1521,
  tags: ["punk", "cervesa"],
  address: "C/ Verdi 1",
  created_at: "2026-01-01T00:00:00Z",
  created_by: "user-1",
};

const listSpot = {
  id: "spot-1",
  name: "El Pona",
  image_url: "https://example.com/pona.png",
  category: "Bars",
  district: "Gràcia",
  latitude: 41.3869,
  longitude: 2.1521,
};

describe("spotsService.getById", () => {
  it("returns the spot when found", async () => {
    const builder = setSupabaseMock(ok(detailSpot));
    const result = await spotsService.getById("spot-1");
    expect(result).toEqual(detailSpot);
    expect(supabase.from).toHaveBeenCalledWith("spots");
    expect(builder.select).toHaveBeenCalledWith(
      "id, name, description, image_url, website, category, district, latitude, longitude, tags, address",
    );
    expect(builder.eq).toHaveBeenCalledWith("id", "spot-1");
    expect(builder.single).toHaveBeenCalledTimes(1);
  });

  it("returns null when no spot matches", async () => {
    setSupabaseMock(ok(null));
    await expect(spotsService.getById("missing")).resolves.toBeNull();
  });

  it("throws when supabase returns an error", async () => {
    setSupabaseMock(fail("boom"));
    await expect(spotsService.getById("spot-1")).rejects.toThrow("boom");
  });
});

describe("spotsService.getByCategory", () => {
  it("returns the page of spots with the total count", async () => {
    const builder = setSupabaseMock(ok([listSpot], 23));
    const result = await spotsService.getByCategory("Bars", 0, 14);
    expect(result).toEqual({ data: [listSpot], count: 23 });
    expect(builder.select).toHaveBeenCalledWith(
      "id, name, image_url, category, district, latitude, longitude",
      { count: "exact" },
    );
    expect(builder.or).toHaveBeenCalledWith('category.eq.Bars,tags.cs.{"bars"}');
    expect(builder.order).toHaveBeenCalledWith("created_at", {
      ascending: false,
    });
    expect(builder.range).toHaveBeenCalledWith(0, 14);
  });

  it("returns an empty page when no spots match", async () => {
    setSupabaseMock(ok([], 0));
    const result = await spotsService.getByCategory("Cinema", 0, 14);
    expect(result).toEqual({ data: [], count: 0 });
  });

  it("throws when supabase returns an error", async () => {
    setSupabaseMock(fail("boom"));
    await expect(
      spotsService.getByCategory("Bars", 0, 14),
    ).rejects.toThrow("boom");
  });
});

describe("spotsService.getByDistrict", () => {
  it("returns the page of spots with the total count", async () => {
    const builder = setSupabaseMock(ok([listSpot], 7));
    const result = await spotsService.getByDistrict("Gràcia", 15, 29);
    expect(result).toEqual({ data: [listSpot], count: 7 });
    expect(builder.eq).toHaveBeenCalledWith("district", "Gràcia");
    expect(builder.range).toHaveBeenCalledWith(15, 29);
  });

  it("throws when supabase returns an error", async () => {
    setSupabaseMock(fail("boom"));
    await expect(
      spotsService.getByDistrict("Gràcia", 0, 14),
    ).rejects.toThrow("boom");
  });
});

describe("spotsService.getByTag", () => {
  it("returns the page of spots with the total count", async () => {
    const builder = setSupabaseMock(ok([listSpot], 3));
    const result = await spotsService.getByTag("punk", 0, 14);
    expect(result).toEqual({ data: [listSpot], count: 3 });
    expect(builder.contains).toHaveBeenCalledWith("tags", ["punk"]);
  });

  it("throws when supabase returns an error", async () => {
    setSupabaseMock(fail("boom"));
    await expect(spotsService.getByTag("punk", 0, 14)).rejects.toThrow("boom");
  });
});

describe("spotsService.getByCategoryAndDistrict", () => {
  it("returns the page of spots filtering by district and category", async () => {
    const builder = setSupabaseMock(ok([listSpot], 5));
    const result = await spotsService.getByCategoryAndDistrict(
      "Bars",
      "Eixample",
      0,
      14,
    );
    expect(result).toEqual({ data: [listSpot], count: 5 });
    expect(builder.eq).toHaveBeenCalledWith("district", "Eixample");
    expect(builder.or).toHaveBeenCalledWith('category.eq.Bars,tags.cs.{"bars"}');
  });

  it("throws when supabase returns an error", async () => {
    setSupabaseMock(fail("boom"));
    await expect(
      spotsService.getByCategoryAndDistrict("Bars", "Eixample", 0, 14),
    ).rejects.toThrow("boom");
  });
});

describe("spotsService.getRandom", () => {
  it("returns a random spot", async () => {
    setSupabaseMock(ok(listSpot));
    const result = await spotsService.getRandom();
    expect(result).toEqual(listSpot);
    expect(supabase.rpc).toHaveBeenCalledWith("get_random_spot");
  });

  it("returns null when no spot is returned", async () => {
    setSupabaseMock(ok(null));
    await expect(spotsService.getRandom()).resolves.toBeNull();
  });

  it("throws when supabase returns an error", async () => {
    setSupabaseMock(fail("boom"));
    await expect(spotsService.getRandom()).rejects.toThrow("boom");
  });
});

describe("spotsService.getNearest", () => {
  it("returns the nearest spot with its computed distance", async () => {
    setSupabaseMock(
      ok({ ...listSpot, id: "spot-1", latitude: 0, longitude: 0.5 }),
    );
    const result = await spotsService.getNearest(0, 0);
    expect(supabase.rpc).toHaveBeenCalledWith("get_nearest_spot", {
      user_lat: 0,
      user_lon: 0,
    });
    expect(result?.spot.id).toBe("spot-1");
    // 0.5° of longitude at the equator ≈ 55.6 km
    expect(result?.distance).toBeGreaterThan(50);
    expect(result?.distance).toBeLessThan(60);
  });

  it("returns null when there is no spot nearby", async () => {
    setSupabaseMock(ok(null));
    await expect(spotsService.getNearest(0, 0)).resolves.toBeNull();
  });

  it("throws when supabase returns an error", async () => {
    setSupabaseMock(fail("boom"));
    await expect(spotsService.getNearest(0, 0)).rejects.toThrow("boom");
  });
});

describe("spotsService.getNearby", () => {
  it("returns the ordered list of nearby spots", async () => {
    const list = [listSpot, { ...listSpot, id: "spot-2" }];
    setSupabaseMock(ok(list));
    const result = await spotsService.getNearby(41.38, 2.17);
    expect(result).toEqual(list);
    expect(supabase.rpc).toHaveBeenCalledWith("get_nearby_spots", {
      user_lat: 41.38,
      user_lon: 2.17,
      max_results: 50,
    });
  });

  it("uses the provided limit", async () => {
    setSupabaseMock(ok([listSpot]));
    await spotsService.getNearby(41.38, 2.17, 10);
    expect(supabase.rpc).toHaveBeenCalledWith("get_nearby_spots", {
      user_lat: 41.38,
      user_lon: 2.17,
      max_results: 10,
    });
  });

  it("throws when supabase returns an error", async () => {
    setSupabaseMock(fail("boom"));
    await expect(spotsService.getNearby(41.38, 2.17)).rejects.toThrow("boom");
  });
});

describe("spotsService.create", () => {
  it("inserts the spot and returns the created row", async () => {
    const builder = setSupabaseMock(ok(detailSpot));
    const input = {
      name: detailSpot.name,
      description: detailSpot.description,
      image_url: detailSpot.image_url,
      website: detailSpot.website,
      category: detailSpot.category,
      district: detailSpot.district,
      latitude: detailSpot.latitude,
      longitude: detailSpot.longitude,
      tags: detailSpot.tags,
      address: detailSpot.address,
    } as any;
    const result = await spotsService.create(input);
    expect(result).toEqual(detailSpot);
    expect(supabase.from).toHaveBeenCalledWith("spots");
    expect(builder.insert).toHaveBeenCalledWith(input);
    expect(builder.select).toHaveBeenCalledTimes(1);
    expect(builder.single).toHaveBeenCalledTimes(1);
  });

  it("throws when supabase returns an error", async () => {
    setSupabaseMock(fail("boom"));
    await expect(spotsService.create({} as any)).rejects.toThrow("boom");
  });
});