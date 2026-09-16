# 📊 Informe de Auditoría de Rendimiento Supabase/React Native

A continuación se detallan **7 problemas críticos** identificados que están contribuyendo al alto uso de RAM (86%) en tu instancia gratuita de Supabase.

---

## 🔴 PROBLEMA #1: Patrón N+1 CRÍTICO en Favoritos

**Archivo:** [favorites.tsx](file:///c:/projects/getoutbcn/app/favorites.tsx#L35-L41)
**Líneas:** 35-41

### Código problemático:

```typescript
const favorites = await favoritesService.getByUserId(user!.id);
const spotIds = favorites.map((f) => f.spot_id);

// Fetch all spots
const spots = await Promise.all(spotIds.map((id) => spotsService.getById(id)));
```

### Impacto en el rendimiento:

Para un usuario con **50 favoritos**, se ejecutan:

- **1 llamada** para obtener la lista de IDs de favoritos
- **50 llamadas individuales** para obtener cada spot por ID
- **Total: 51 llamadas a la BD** por visita a la pantalla

Cada conexión abre un proceso en Postgres, consumiendo memoria y CPU.

### Solución propuesta:

Agregar un nuevo método en `favoritesService` que use **JOIN** (o `.in()` con una sola consulta):

```typescript
// En services/supabase/favorites.ts
async getSpotsByUserId(userId: string): Promise<Spot[]> {
  const { data, error } = await supabase
    .from("favorites")
    .select(`
      spots (
        id, name, description, image_url, website,
        category, district, latitude, longitude, tags, address
      )
    `)
    .eq("user_id", userId);
  if (error) throw error;
  return (data || []).map(f => f.spots).filter(Boolean) as Spot[];
}

// Alternativa sin JOIN (una sola llamada usando .in()):
async getSpotsByUserIdAlt(userId: string): Promise<Spot[]> {
  const { data: favs, error: favError } = await supabase
    .from("favorites")
    .select("spot_id")
    .eq("user_id", userId);
  if (favError) throw favError;

  const ids = (favs || []).map(f => f.spot_id);
  if (ids.length === 0) return [];

  const { data, error } = await supabase
    .from("spots")
    .select("id, name, description, image_url, website, category, district, latitude, longitude, tags, address")
    .in("id", ids);
  if (error) throw error;
  return data || [];
}
```

### Impacto estimado:

✅ **Reduce las llamadas a la base de datos de 51 a 1** (o 2 máximo).
💾 Ahorro estimado: ~80% de recursos en esta pantalla.

---

## 🟠 PROBLEMA #2: `getAll()` Carga TODOS los spots para calcular "cercano"

**Archivo:** [index.tsx](file:///c:/projects/getoutbcn/app/index.tsx#L79-L91) y [spots.ts](file:///c:/projects/getoutbcn/services/supabase/spots.ts#L5-L9)
**Líneas index.tsx:** 79-91 | **Líneas spots.ts:** 5-9

### Código problemático:

```typescript
// spots.ts
async getAll(): Promise<Spot[]> {
  const { data, error } = await supabase.from("spots").select("*");
  // ...
}

// index.tsx
async function loadNearbySpot(userLat: number, userLon: number) {
  const allSpots = await spotsService.getAll(); // <-- TRAE TODO
  const nearest = findNearestSpot(userLat, userLon, allSpots);
  // ...
}
```

### Impacto en el rendimiento:

Cada vez que un usuario abre la app home y tiene ubicación activada:

- Se descargan **TODOS los spots** de la base (con `select("*")`)
- Si hay 1.000 spots, se transfieren ~15 columnas × 1.000 filas por la red
- Todo ese volumen se procesa en memoria JS → presión alta en GC
- Postgres debe materializar toda la tabla en memoria RAM

### Solución propuesta:

Calcular la distancia **directamente en Postgres** usando el operador de distancia de Earthdistance o una función RPC, retornando solo 1 registro:

```typescript
// En spots.ts - Opción 1: Usar RPC de Supabase (recomendado)
async getNearest(lat: number, lon: number): Promise<{spot: Spot, distance: number} | null> {
  const { data, error } = await supabase
    .rpc('get_nearest_spot', { user_lat: lat, user_lon: lon })
    .select(`
      id, name, description, image_url, website,
      category, district, latitude, longitude, tags, address,
      distance
    `)
    .limit(1)
    .single();
  if (error || !data) return null;
  const { distance, ...spot } = data;
  return { spot: spot as Spot, distance };
}

// Alternativa sin RPC: Limitar con bbox primero (1 sola llamada, pocos datos)
async getNearestSimple(lat: number, lon: number): Promise<Spot | null> {
  const delta = 0.02; // ~2km aprox
  const { data, error } = await supabase
    .from("spots")
    .select("id, name, description, image_url, category, district, latitude, longitude")
    .gte("latitude", lat - delta)
    .lte("latitude", lat + delta)
    .gte("longitude", lon - delta)
    .lte("longitude", lon + delta)
    .limit(50);
  if (error) throw error;
  // Luego findNearestSpot() procesa SOLO 50 spots, no todos
  if (!data || data.length === 0) return null;
  const nearest = findNearestSpot(lat, lon, data);
  return nearest?.spot || null;
}
```

Y crear la migración SQL para el índice y la función RPC:

```sql
-- Índice GIST para lat/lon
CREATE INDEX IF NOT EXISTS idx_spots_location ON spots USING GIST (point(longitude, latitude));

-- Función RPC
CREATE OR REPLACE FUNCTION get_nearest_spot(user_lat float, user_lon float)
RETURNS SETOF spots AS $$
  SELECT *
  FROM spots
  ORDER BY point(longitude, latitude) <-> point(user_lon, user_lat)
  LIMIT 1;
$$ LANGUAGE sql STABLE;
```

### Impacto estimado:

✅ **Reduce datos transferidos de ~1000 filas a 1 fila.**
💾 Ahorro estimado: ~95% de ancho de banda y memoria en esta consulta.

---

## 🟠 PROBLEMA #3: Doble Consulta Innecesaria en `getByCategory` y `getByCategoryAndDistrict`

**Archivo:** [spots.ts](file:///c:/projects/getoutbcn/services/supabase/spots.ts#L21-L85)
**Líneas:** 21-39 (getByCategory) y 59-85 (getByCategoryAndDistrict)

### Código problemático:

```typescript
async getByCategory(category: string): Promise<Spot[]> {
  const [catResults, tagResults] = await Promise.all([
    supabase.from("spots").select("*").eq("category", category),
    supabase.from("spots").select("*").contains("tags", [category.toLowerCase()]),
  ]);
  // Luego merge manual con Map...
}
```

### Impacto en el rendimiento:

- **2 consultas completas con `select("*")`** cada vez que se filtra por categoría
- Ambas consultas escanean potencialmente la tabla completa (si no hay índices)
- El merge en memoria JS (Map) consume CPU adicional
- Postgres debe procesar 2 planes de ejecución en vez de 1

### Solución propuesta:

Combinar ambas condiciones en **UNA SOLA CONSULTA** usando `.or()`:

```typescript
async getByCategory(category: string): Promise<Spot[]> {
  const { data, error } = await supabase
    .from("spots")
    .select("id, name, description, image_url, website, category, district, latitude, longitude, tags, address")
    .or(`category.eq.${category},tags.cs.{${category.toLowerCase()}}`);
  if (error) throw error;
  return data || [];
}

// Para getByCategoryAndDistrict:
async getByCategoryAndDistrict(category: string, district: string): Promise<Spot[]> {
  const { data, error } = await supabase
    .from("spots")
    .select("id, name, description, image_url, website, category, district, latitude, longitude, tags, address")
    .eq("district", district)
    .or(`category.eq.${category},tags.cs.{${category.toLowerCase()}}`);
  if (error) throw error;
  return data || [];
}
```

### Impacto estimado:

✅ **Reduce a la mitad las consultas a la BD** en estas rutas (2 → 1).
💾 Ahorro estimado: 50% de recursos en búsquedas por categoría.

---

## 🟡 PROBLEMA #4: `getRandom()` Ineficiente (2 consultas + count exact)

**Archivo:** [spots.ts](file:///c:/projects/getoutbcn/services/supabase/spots.ts#L87-L106)
**Líneas:** 87-106

### Código problemático:

```typescript
async getRandom(): Promise<Spot | null> {
  // 1. Count EXACT: escanea toda la tabla para contar
  const { count, error: countError } = await supabase
    .from("spots")
    .select("*", { count: "exact", head: true });

  // 2. Offset aleatorio: Postgres materializa todas las filas hasta offset
  const { data, error } = await supabase
    .from("spots")
    .select("*")
    .range(randomIndex, randomIndex)
    .single();
}
```

### Impacto en el rendimiento:

- `count: "exact"` → **escanea toda la tabla** cada vez (muy caro en tablas grandes)
- `.range(N,N)` con N alto → Postgres debe recorrer y descartar N filas
- Total: **2 consultas pesadas** por visita a home screen
- El `select("*")` añade presión de memoria sin necesidad

### Solución propuesta:

Usar ordenamiento aleatorio nativo de Postgres (TABLESAMPLE o `ORDER BY random()`) en una **RPC** o llamada directa:

```typescript
// En spots.ts - Opción 1: RPC (mejor rendimiento)
async getRandom(): Promise<Spot | null> {
  const { data, error } = await supabase
    .from("spots")
    .select("id, name, description, image_url, category, district, latitude, longitude")
    .order("id") // usar columna indexada
    .limit(1)
    .offset(Math.floor(Math.random() * 1000)); // asumiendo <1000 spots

  if (error) throw error;
  return (data && data[0]) || null;
}

// Versión mejorada con RPC:
async getRandomRpc(): Promise<Spot | null> {
  const { data, error } = await supabase.rpc('get_random_spot');
  if (error) throw error;
  return data || null;
}
```

SQL de la RPC:

```sql
CREATE OR REPLACE FUNCTION get_random_spot()
RETURNS SETOF spots AS $$
  SELECT id, name, description, image_url, category, district, latitude, longitude, tags, address, website
  FROM spots TABLESAMPLE SYSTEM (1)
  LIMIT 1;
$$ LANGUAGE sql;
```

### Impacto estimado:

✅ **Reduce de 2 consultas a 1** y elimina el `count: "exact"` de alta carga.
💾 Ahorro estimado: ~70% de recursos en esta consulta.

---

## 🟡 PROBLEMA #5: Uso Generalizado de `select("*")` (11 ocurrencias)

**Archivos afectados y líneas:**
| Archivo | Línea(s) | Uso |
|---------|----------|-----|
| [spots.ts](file:///c:/projects/getoutbcn/services/supabase/spots.ts) | 6, 14, 23, 26, 44, 53, 66, 71, 100 | 9 usos |
| [favorites.ts](file:///c:/projects/getoutbcn/services/supabase/favorites.ts) | 8 | 1 uso |
| [profiles.ts](file:///c:/projects/getoutbcn/services/supabase/profiles.ts) | 8 | 1 uso |

### Impacto en el rendimiento:

Cada `select("*")` implica:

1. **Mayor uso de RAM en Postgres:** debe cargar todas las columnas (incluyendo `description` TEXT largo, `tags` array, `address`, etc.) incluso cuando no se necesitan
2. **Mayor tráfico de red:** bytes innecesarios viajan por la red
3. **Menos oportunidades de index-only scans:** Postgres no puede usar solo índices, debe acceder a la tabla (heap)

**Ejemplo con datos reales (Spot):**

- Columnas de Spot: 15 campos
- En `SpotCard.tsx` solo se usan: `id, name, image_url, category, district` → **5 columnas**
- `select("*")` está trayendo **10 columnas extra** (66% de desperdicio) por cada fila

### Solución propuesta:

Seleccionar **solo las columnas necesarias** en cada servicio:

```typescript
// spots.ts - Para listados (SpotCard solo necesita 5-8 cols)
async getByDistrict(district: string): Promise<Spot[]> {
  const { data, error } = await supabase
    .from("spots")
    .select("id, name, image_url, category, district, latitude, longitude") // SOLO lo necesario
    .eq("district", district);
  if (error) throw error;
  return data || [];
}

// Para detalle de spot (sí necesitamos más cols)
async getById(id: string): Promise<Spot | null> {
  const { data, error } = await supabase
    .from("spots")
    .select("id, name, description, image_url, website, category, district, latitude, longitude, tags, address, created_by, created_at")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

// favorites.ts - Solo necesitamos spot_id en getByUserId cuando luego cargamos spots
async getByUserId(userId: string): Promise<Favorite[]> {
  const { data, error } = await supabase
    .from("favorites")
    .select("id, spot_id, created_at") // NO necesitamos user_id (ya lo sabemos)
    .eq("user_id", userId);
  if (error) throw error;
  return data || [];
}
```

### Impacto estimado:

✅ **Reduce transferencia de datos entre 50% y 70%** en consultas de listado.
💾 Reduce significativamente el working set de Postgres en RAM (menos tuplas cargadas).

---

## 🟡 PROBLEMA #6: Falta de Índices en Columnas de Filtrado Frecuente

**Ubicación:** No es un archivo de código, sino en **migraciones SQL** (actualmente no existen migraciones en el repo según el Glob).

### Columnas filtradas FRECUENTEMENTE sin índices (probable):

| Tabla       | Columna(s)              | Tipo de filtrado               |
| ----------- | ----------------------- | ------------------------------ |
| `spots`     | `category`              | `.eq()`                        |
| `spots`     | `district`              | `.eq()`                        |
| `spots`     | `category` + `district` | `.eq()` compuesto              |
| `spots`     | `tags`                  | `.contains()` (array)          |
| `spots`     | `created_by`            | FK / potencial filtrado futuro |
| `favorites` | `user_id`               | `.eq()`                        |
| `favorites` | `user_id` + `spot_id`   | `.eq()` compuesto (unique)     |

### Impacto en el rendimiento:

Sin índices, Postgres realiza **Sequential Scans** (lectura completa de la tabla) en cada consulta:

- Tabla de 1000 spots: 1000 bloques leídos de disco/RAM por consulta
- Con índice B-tree: ~3-4 bloques leídos (logarítmico)
- Cada Seq Scan contamina la caché compartida (shared_buffers), expulsando datos útiles

### Solución propuesta (migración SQL):

```sql
-- ============================================================
-- ÍNDICES PARA TABLA spots
-- ============================================================

-- 1. Índice para category (filtrado frecuente)
CREATE INDEX IF NOT EXISTS idx_spots_category ON spots (category);

-- 2. Índice para district (filtrado frecuente)
CREATE INDEX IF NOT EXISTS idx_spots_district ON spots (district);

-- 3. Índice COMPUESTO para category + district (ruta de búsqueda combinada)
CREATE INDEX IF NOT EXISTS idx_spots_category_district ON spots (category, district);

-- 4. Índice GIN para array tags (permite contains/overlap eficientes)
CREATE INDEX IF NOT EXISTS idx_spots_tags ON spots USING GIN (tags);

-- 5. Índice para created_by (FK)
CREATE INDEX IF NOT EXISTS idx_spots_created_by ON spots (created_by);

-- ============================================================
-- ÍNDICES PARA TABLA favorites
-- ============================================================

-- 6. Índice para user_id (filtrado principal)
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites (user_id);

-- 7. Índice COMPUESTO ÚNICO para user_id + spot_id (evita duplicados + búsqueda eficiente)
CREATE UNIQUE INDEX IF NOT EXISTS idx_favorites_user_spot ON favorites (user_id, spot_id);

-- 8. Índice para spot_id (FK a spots)
CREATE INDEX IF NOT EXISTS idx_favorites_spot_id ON favorites (spot_id);

-- ============================================================
-- ÍNDICES PARA TABLA profiles
-- ============================================================

-- 9. PK ya existe (id), pero si filtramos por email:
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles (email);
```

### Impacto estimado:

✅ **Tiempo de consulta pasa de O(n) a O(log n)** en todos los filtrados.
💾 En una tabla con 10.000 filas: pasa de leer 10.000 bloques a ~4-5 bloques por consulta.
✅ **Reduce uso de shared_buffers** (menos páginas cacheadas = menos RAM usada).

---

## 🟢 PROBLEMA #7: `isFavorite()` por Separado - Futuro N+1 Potencial

**Archivo:** [favorites.ts](file:///c:/projects/getoutbcn/services/supabase/favorites.ts#L33-L41) y [[id].tsx](file:///c:/projects/getoutbcn/app/spot/[id].tsx#L27-L30)
**Líneas favorites.ts:** 33-41 | **Líneas [id].tsx:** 27-30

### Código problemático:

```typescript
// [id].tsx
useEffect(() => {
  loadSpot();              // 1 llamada para el spot
  if (user) checkFavorite(); // 1 llamada EXTRA para favorito (2ª conexión)
}, [id, user]);

// favorites.ts
async isFavorite(userId: string, spotId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", userId)
    .eq("spot_id", spotId)
    .single();
  return !!data && !error;
}
```

### Impacto en el rendimiento:

Actualmente solo son 2 llamadas en la pantalla de detalle. **Pero el riesgo está en el futuro**:

- Si `SpotCard` (usado en listados de 50 items) añadiera un botón de favoritos y llamara a `isFavorite()` por cada item → sería N+1 (51 llamadas)
- `.single()` en `isFavorite` lanza un error cuando no encuentra favorito → PostgREST registra error → overhead

### Solución propuesta:

1. **En detalle:** Combinar en una sola consulta si es posible, o usar `.maybeSingle()`
2. **En listados:** Pre-cargar favoritos en una sola llamada y hacer lookup en mapa

```typescript
// favorites.ts - Versión segura sin error cuando no existe
async isFavorite(userId: string, spotId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", userId)
    .eq("spot_id", spotId)
    .maybeSingle(); // <-- NO lanza error si no existe
  if (error) {
    console.error("isFavorite error:", error);
    return false;
  }
  return !!data;
}

// Para listados: pre-cargar favoritos en 1 sola llamada
async getFavoriteSpotIds(userId: string): Promise<Set<string>> {
  const { data, error } = await supabase
    .from("favorites")
    .select("spot_id")
    .eq("user_id", userId);
  if (error) throw error;
  return new Set((data || []).map(f => f.spot_id));
}
```

Y en pantallas de listado, usar:

```typescript
// Uso en CategoryListScreen (ejemplo)
const [favIds, setFavIds] = useState<Set<string>>(new Set());

useEffect(() => {
  if (user) {
    favoritesService.getFavoriteSpotIds(user.id).then(setFavIds);
  }
}, [user]);

// Luego en SpotCard:
// isFavorite={favIds.has(spot.id)} → 0 llamadas extra, solo lookup en Set O(1)
```

### Impacto estimado:

✅ **Previene un N+1 catastrófico** en listados cuando se añadan botones de favorito.
✅ Elimina errores spureos en logs de Supabase por `.single()` sin resultados.

---

## 📋 Resumen de Prioridades

| Prioridad  | Problema                      | Ahorro estimado RAM/CPU       |
| ---------- | ----------------------------- | ----------------------------- |
| 🔴 URGENTE | #1 N+1 en Favoritos           | ~80% en esa ruta              |
| 🔴 URGENTE | #2 getAll() para Nearby       | ~95% datos transferidos       |
| 🟠 ALTA    | #3 Doble consulta en Category | ~50% consultas                |
| 🟠 ALTA    | #6 Falta de índices           | Consultas de O(n) → O(log n)  |
| 🟡 MEDIA   | #4 getRandom ineficiente      | ~70% en esa consulta          |
| 🟡 MEDIA   | #5 select("\*") generalizado  | 50-70% ancho de banda y caché |
| 🟢 BAJA    | #7 isFavorite por separado    | Prevención de N+1 futuro      |

---

## 🎯 Siguiente Paso

Cuando confirmes, procederé a aplicar estas optimizaciones **en orden de prioridad**:

1. Primero índices (SQL) → mejora inmediata sin cambios de código
2. Luego `select()` específicos y corrección de N+1
3. Finalmente RPCs para getRandom y getNearest

**¿Confirmas que proceda con la implementación?**
