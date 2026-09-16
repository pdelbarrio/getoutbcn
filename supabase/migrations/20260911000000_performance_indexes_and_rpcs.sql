-- ============================================================
-- PERFORMANCE INFORMES QUERIES
-- (aditivo: no modifica esquema ni datos existentes)
-- ============================================================

-- -----------------------------------------------------------------
-- 1. Desduplicar favoritos ANTES del índice único
--    (se conserva la fila más reciente por user_id + spot_id)
-- -----------------------------------------------------------------
DELETE FROM favorites a
USING favorites b
WHERE a.user_id = b.user_id
  AND a.spot_id = b.spot_id
  AND (a.created_at < b.created_at
       OR (a.created_at = b.created_at AND a.ctid < b.ctid));

-- ============================================================
-- 2. ÍNDICES PARA TABLA spots
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_spots_category ON spots (category);

CREATE INDEX IF NOT EXISTS idx_spots_district ON spots (district);

CREATE INDEX IF NOT EXISTS idx_spots_category_district ON spots (category, district);

CREATE INDEX IF NOT EXISTS idx_spots_tags ON spots USING GIN (tags);

CREATE INDEX IF NOT EXISTS idx_spots_created_by ON spots (created_by);

CREATE INDEX IF NOT EXISTS idx_spots_location ON spots USING GIST (point(longitude, latitude));

-- ============================================================
-- 3. ÍNDICES PARA TABLA favorites
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites (user_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_favorites_user_spot ON favorites (user_id, spot_id);

CREATE INDEX IF NOT EXISTS idx_favorites_spot_id ON favorites (spot_id);

-- ============================================================
-- 4. ÍNDICE PARA TABLA profiles
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles (email);

-- ============================================================
-- 5. RPC get_random_spot
-- ============================================================

CREATE OR REPLACE FUNCTION get_random_spot()
RETURNS SETOF spots
LANGUAGE sql
STABLE
AS $$
  SELECT *
  FROM spots
  ORDER BY random()
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION get_random_spot() TO anon, authenticated, service_role;

-- ============================================================
-- 6. RPC get_nearest_spot
--    Devuelve la fila completa (la distancia la calcula el cliente)
-- ============================================================

CREATE OR REPLACE FUNCTION get_nearest_spot(user_lat float, user_lon float)
RETURNS SETOF spots
LANGUAGE sql
STABLE
AS $$
  SELECT *
  FROM spots
  WHERE latitude IS NOT NULL
    AND longitude IS NOT NULL
    AND latitude <> 0
    AND longitude <> 0
  ORDER BY point(longitude, latitude) <-> point(user_lon, user_lat)
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION get_nearest_spot(float, float) TO anon, authenticated, service_role;