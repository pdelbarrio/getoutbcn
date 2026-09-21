# GetOutBCN — Documentación del Proyecto

> Documento vivo. Consolida el estado actual del proyecto y su historial (fuentes: `REBUILD_PLAN.md` y `docs/NEXT_SESSIONS.md`).
> Última actualización: 21 de septiembre de 2026.

---

## 1. Resumen Ejecutivo

**GetOutBCN** es una app móvil (Expo / React Native) para descubrir lugares de Barcelona —spots—, con categorías, distritos, etiquetas, favoritos y geolocalización. La app **está funcional y navegable end-to-end**: Home con "Lloc aleatori" y "Lloc proper", listados filtrables, detalle de spot con mapa, autenticación (email + Google), alta de spots con subida de imágenes, y perfil.

Estado clave:

- **Stack estable en Windows:** Expo SDK 54 (LTS) + expo-router 6 + Supabase. SDK 56/57 provocan un fallo AJV v8 en Windows (ver § 4.2). Regla de oro: instalar siempre con `npx expo install`.
- **Supabase:** auth, base de datos, storage (subida vía Edge Function `generate-upload-url`) y RPCs (`get_random_spot`, `get_nearest_spot`, `get_nearby_spots`, `toggle_favorite`) ya desplegadas.
- **Paginación (lazy loading):** implementada en los listados (categoría, distrito, categoría+distrito, tag, favoritos) con `PAGE_SIZE = 15`, RPC `get_nearby_spots` para el "A prop", y hook reutilizable `usePaginatedSpots`.
- **Testing:** Jest + ts-jest configurado; **43 tests en verde y cobertura 100%** (statements/functions/lines) para `services/supabase/spots.ts` y `favorites.ts`.
- **CI/CD:** workflow GitHub Actions `build-android.yml` (prebuild + APK release, disparo manual). `eas.json` con perfiles development / preview / production (APK).
- **Pendiente urgente:** ampliar tests, verificar login Google en dev build, y preparar el lanzamiento en tienda (Play Store).

### Próximas Acciones (prioridad alta)

| # | Acción | Alcance | Notas |
|---|--------|---------|-------|
| 1 | **Ampliar cobertura de tests** | `services/supabase/{auth,profiles,storage}.ts`, `utils/geolocation.ts`, constantes, y componentes (`CategoryRow`, `DistrictRow`, `SpotCard`, `SpotDetailHeader`) | Hoy solo `spots.ts` y `favorites.ts`. Para componentes: `jest-expo` + `@testing-library/react-native` |
| 2 | **Preparación para la tienda (Play Store)** | Pruebas de humo sobre APK real, iconos/feature graphic, política de privacidad, age rating, contenido y datos de la ficha | `eas build --platform android --profile production`; `eas submit` configurado en `eas.json` |
| 3 | **Verificar login con Google** | Probar flujo `signInWithOAuth` en una dev build / APK | ⚠️ No funciona en Expo Go; requiere rebuild del binario (`npx expo run:android`) |
| 4 | **Seguridad** | RLS: verificar + documentar políticas; sanitizar `Linking.openURL` en `SpotInfo.tsx` (solo `http/https`); endurecer la Edge Function (validar JWT); `npm audit` (16 moderate / 12 high) | Ver § 3 "Pendientes de seguridad" |
| 5 | **Revista de calidad UX** | Accesibilidad (labels/screen readers), optimización de imágenes, estados vacíos en listados | Pendientes "Retocar" en la sección histórica |

---

## 2. Tabla de Estado de Funcionalidades

| Funcionalidad | Ruta / Módulo | Estado | Observaciones |
|---|---|---|---|
| Home (búsqueda, categorías, distritos) | `app/index.tsx` | ✅ Operativo | Carruseles animados `CategoryRow`/`DistrictRow`, `RandomSpotCard`, `NearbySpotCard` |
| **Mapa general** | `app/map.tsx` | ✅ Operativo | Todos los spots (excluye `No district` y coords `0,0`) con marker/icono por categoría; callout → detalle; acceso desde el header de Home |
| Listado por categoría | `app/category/[category].tsx` | ✅ Paginado | `PAGE_SIZE=15`, count `exact`, `onEndReached`, pull-to-refresh |
| Listado por distrito | `app/district/[district].tsx` | ✅ Paginado | Ídem |
| Búsqueda categoría × distrito | `app/search/[category]/[district].tsx` | ✅ Paginado | Key compuesta para reset automático |
| Listado por etiqueta | `app/tag/[tag].tsx` | ✅ Paginado | Ídem |
| Detalle de spot | `app/spot/[id].tsx` | ✅ Operativo | Mapa, tags, dirección, favorito |
| **"Com arribar-hi"** | `spot/[id].tsx` + `Linking.openURL` | ✅ Operativo | Rutas Google Maps desde la ubicación actual (propia app) |
| **Compartir mejorado** | `components/SpotDetailHeader.tsx` | ✅ Operativo | Nombre + descripción corta + enlace Google Maps; fallback sin coordenadas |
| "A prop" (cerca de mí) | `app/index.tsx` + `app/nearby.tsx` | ✅ Operativo | RPC `get_nearby_spots` (orden por distancia, cap 50) |
| Favoritos | `app/favorites.tsx` | ✅ Paginado | Join 1:1 `favorites→spots`, `toggle_favorite` RPC |
| Login / Registro (email) | `app/login.tsx`, `app/signup.tsx` | ✅ Operativo | Validaciones cliente + Supabase Auth |
| Login social Google | `app/login.tsx` + `services/supabase/social-auth.ts` | 🔶 Implementado, sin verificar | Solo dev build; tokens/code vía `openAuthSessionAsync` |
| Alta de spots | `app/add-spot.tsx` | ✅ Operativo | Imagen + ubicación + generación de URL firmada |
| Subida de imágenes | Edge Func `generate-upload-url` + `storage.ts` | ✅ Operativo | Signed URL → PUT → `getPublicUrl` |
| Perfil / Logout | `app/profile.tsx` | ✅ Operativo | Protegido por auth |
| Mapa Google | `MapViewWrapper` + plugin `withGoogleMapsApiKey` | ✅ Operativo | API key inyectada vía plugin personalizado en el manifest |
| Traducciones al catalán | `constants/Translations.ts` | ✅ Operativo | `t` centralizado |
| Theme industrial dark | `constants/Theme.ts` | ✅ Operativo | Verde tóxico `#A9F900` |
| Animaciones | Reanimated (auto-scroll, micro-interacciones) | ✅ Operativo | |
| Paginación / Lazy Loading | `hooks/usePaginatedSpots.ts` | ✅ Operativo | Aplicada en 5 listados |
| **Testing unitario** | `__tests__/supabase/` | ✅ Parcial | 43 tests, 100% en `spots.ts` y `favorites.ts`; resto sin cubrir |
| CI Android | `.github/workflows/build-android.yml` | ✅ Operativo | `workflow_dispatch`, prebuild + gradle `assembleRelease` |
| **Publicación en tienda** | `eas submit` | ❌ Pendiente | Preparación para Play Store pendiente (§ 1) |

---

## 3. Pendientes de Seguridad (investigados, sin ejecutar)

Fuente: `docs/NEXT_SESSIONS.md` § 2.

- **RLS (Row Level Security):** verificar políticas de `spots` y demás tablas; documentarlas en README (sección SECURITY).
- **Sanitizar URLs:** `SpotInfo.tsx` llama `Linking.openURL(website)` directo. Validar esquema `http/https` antes de abrir para evitar esquemas maliciosos provenientes de la BD.
- **Auditoría de dependencias:** `npm audit` (16 moderate / 12 high reportadas).
- **Endurecer `supabase/functions/generate-upload-url/index.ts`:** actualmente solo valida el header `Authorization`; añadir verificación del JWT (rol/aud).

---

## 4. Archivo (Historial)

### 4.1 Fases completadas (sprints del plan de reconstrucción)

| Fase | Contenido | Estado |
|---|---|---|
| Sprint 1 — Foundation | Crear proyecto Expo SDK 54, dependencias core, expo-router, cliente Supabase, tipos TS, servicios base, `AuthContext` | ✅ |
| Sprint 2 — Home + Navegación | `CategoryRow`, `DistrictRow`, `SearchButton`, Home, listados categoría/distrito/búsqueda, `SpotCard` | ✅ |
| Sprint 3 — SpotDetail | `ImageHeader`, `SpotInfo`, `CategoryTag`, `DistrictButton`, `MapViewWrapper`, detalle completo | ✅ |
| Sprint 4 — Auth | Login, SignUp + validaciones, Profile, rutas protegidas, logout; flujo social Google documentado | ✅ |
| Sprint 5 — AddSpot | `SpotForm`, subida de imagen (Edge Function + signed URL), dropdowns, `LocationButton`, submit | ✅ |
| Sprint 6 — Features avanzadas | Favoritos, `RandomSpotCard`, `NearbySpotCard`, toggle favorito | ✅ |
| Sprint 7 — Polish | Theme, animaciones, micro-interacciones, error/loading states | ✅ |

**Fechas:** plan creado el 5 de agosto de 2026 (versión 2.0). Reconstrucción completa del proyecto (SDK 57 fallido → SDK 54).

### 4.2 Lecciones aprendidas (de `REBUILD_PLAN.md`)

1. **Expo SDK 57 + AJV v8 + Windows falla** (`Cannot find module 'ajv/dist/compile/codegen'`). Solución: usar SDK 54 en Windows; nunca mezclar paquetes de SDK 56/57. Si aparece el error AJV, es síntoma de SDK 56/57.
2. **API key de Google Maps:** `expo-build-properties` NO inyecta la clave en el `AndroidManifest.xml`. Se resuelve con un **plugin personalizado** (`plugins/withGoogleMapsApiKey.js`) que añade el `<meta-data>`, leyendo `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` desde `app.config.js`. La carpeta `android/`/`ios/` está en `.gitignore`; nunca subirla.
3. **Subida de imágenes en móvil:** el upload directo a Supabase Storage falla por CORS/auth. Solución: Edge Function `generate-upload-url` que devuelve una URL firmada de un solo uso; la app hace `PUT` y obtiene la URL pública. Secrets requeridos: `SB_URL` y `SERVICE_ROLE_KEY`.

### 4.3 Funcionalidades añadidas posteriormente al plan (sesiones recientes)

- Botón **"Com arribar-hi"** en el detalle de spot (rutas a Google Maps con `Linking`).
- **Share enriquecido** (nombre + descripción corta + enlace gmaps) en `SpotDetailHeader`.
- Pantalla e integración **"A prop"**: tarjeta del spot más cercano en Home + pantalla `/nearby` con la lista ordenada por distancia (RPC `get_nearby_spots`).
- **Paginación / infinite scroll** en los listados (hook `usePaginatedSpots`, `PAGE_SIZE`, `count: "exact"`), con pull-to-refresh y estados de carga/vacío.
- **Entorno de testing:** Jest + ts-jest, `jest.config.js`, `tsconfig.test.json`, mock manual de `client.ts`, 41 tests unitarios (cobertura 100% en servicios de spots y favoritos).
- **Mapa general (`/map`):** pantalla a pantalla completa con todos los spots (excluye `No district` y coordenadas `0,0`), `Marker` custom con icono Ionicons por categoría (`constants/CategoryIcons.ts`), callout con nombre → detalle, estilo de mapa oscuro y acceso mediante icono `map-outline` en el header de Home. Si el usuario deniega el permiso de ubicación se muestra un aviso y el mapa se centra en Barcelona. Carga completa en una sola query (`spotsService.getAllForMap`); el bounding box queda descartado a esta escala.

### 4.4 Ideas futuras en cartera (`NEXT_SESSIONS.md` / próximos pasos opcionales)

- **Login social:** terminar guía OAuth (redirect URIs en Supabase + Google Cloud) y probar en dev build (§ 1, acción 3).
- **Testing de componentes** con `jest-expo` + `@testing-library/react-native`.
- **Mejoras de producto:** accesibilidad, optimización de imágenes, analytics (PostHog u otro), push notifications, modo offline con AsyncStorage.
- **"Retocar" (UX):** toggle de selección de categoría/distrito en Home; botón de favoritos con icono bookmark reposicionado en el frame superior del detalle; borde ultrafino en tarjetas y botones; color de fondo uniforme en el frame superior (sin área blanca); categoría clicable en el detalle (como el distrito); distritos en scroll horizontal igual que categorías en `add-spot`; icono de lupa en el botón "CERCAR"; revisar el diseño siguiendo referencia (Stitch).

---

## 5. Referencias clave

| Recurso | Propósito |
|---|---|
| `REBUILD_PLAN.md` | Historial completo de fases, comandos y lecciones aprendidas |
| `docs/NEXT_SESSIONS.md` | Trabajo pendiente investigado y por decidir |
| `specs/` (6 archivos) | SDD: data, screens, navigation, flows, components, ui |
| `services/supabase/` | Capa de servicios (auth, spots, favorites, profiles, storage, social-auth) |
| `constants/` | Categorías, distritos, tema y traducciones |
| `__tests__/supabase/` | Tests unitarios de servicios con Supabase mockeado |

---

**Comandos útiles:** `npm test` · `npm run test:watch` · `npx tsc --noEmit` · `npx expo start` · `npx expo run:android` (dev build / login Google) · `eas build --platform android --profile production`.

**Nota Windows:** SDK 54 obligatorio (ver § 4.2). Verificación de types sin lint: `npx tsc --noEmit`.