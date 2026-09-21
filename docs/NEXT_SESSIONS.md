# Próximas sesiones

Trabajo pendiente, investigado pero aún sin ejecutar. Decide qué abordar en la siguiente sesión.

## 1. Login social (Google)

### Estado actual

- `app/login.tsx` tiene un botón "Sign in with Google" que llama a `socialAuthService.signInWithGoogle()`.
- `services/supabase/social-auth.ts` implementa el flujo `signInWithOAuth` con `AuthSession.makeRedirectUri()` (scheme `getoutbcn://`).
- `app.config.js` ya tiene el scheme `getoutbcn` y el plugin `expo-web-browser` activo (necesario para `openAuthSessionAsync`).
- ⚠️ **NO funciona en Expo Go.** Requiere una dev build (`npx expo run:android`).

### Opción A (recomendada): flujo OAuth con `signInWithOAuth` + `AuthSession`

Guía verificada: https://supabase.com/docs/guides/auth/quickstarts/with-expo-react-native-social-auth

1. Estructura (ya casi montada en `services/supabase/social-auth.ts`):
   - `AuthSession.makeRedirectUri()` → una única redirect URI (`getoutbcn://`) sirve para todos los socios.
   - `supabase.auth.signInWithOAuth({ provider: "google", redirectTo: redirectUri })` → devuelve `data.url`.
   - `AuthSession.openAuthSessionAsync(url, redirectUri)` → abre el navegador y, al volver con la URL, entrega `data.url`/`data.type` (incluye parámetros `code` o `error_description`).
   - Procesar la respuesta: si hay `code`, `supabase.auth.exchangeCodeForSession(code)` completa el login; si hay error, mostrarlo.
2. Configuración en el dashboard de Supabase → Authentication → URL Configuration:
   - Añadir la redirect URI (la que imprime `makeRedirectUri()`) al campo **Redirect URLs**, quitando el `#` final si lo añadiera.
3. Consola de Google Cloud (proyecto vinculado a la API Key de Google Maps):
   - Credenciales → **OAuth 2.0 Client IDs** → Web client (el que usa el dashboard de Supabase) → añadir el formato `https://<project-ref>.supabase.co/auth/v1/verify-otp` **y** la propia redirect URI de la app debe registrarse en Supabase, no en Google.
   - Recomendado: activar el consentimiento "External" y añadir las cuentas de test.
4. Rebuild del cliente: `npx expo run:android`.

Bibliografía: docs Expo AuthSession v54 → https://docs.expo.dev/versions/v54.0.0/sdk/auth-session/

### Opción B (alternativa): Google Sign-In nativo + `signInWithIdToken`

- Librería: `@react-native-google-signin/google-signin` (instalar y vincular; requiere rebuild del binario de Android).
- Requiere un **OAuth Android Client** en Google Cloud con el **SHA-1** de tu keystore.
- Tras obtener el `idToken`, llamar a `supabase.auth.signInWithIdToken({ provider: "google", token: idToken })`.

### Decisión tomada en sesión anterior

- NO probar el login social hoy; documentar toda la investigación. (Hecho en este archivo.)

## 2. Seguridad (alcance medio)

- **RLS (Row Level Security) en Supabase**: verificar que las políticas de las tablas (`spots`, etc.) sean correctas y documentarlas en el README (sección SECURITY).
- **Sanitizar URLs**: `components/SpotInfo.tsx` llama `Linking.openURL(website)` directamente. Validar el esquema (`http`/`https` únicamente) antes de abrir, para evitar `Linking.openURL("geo:...")` o esquemas maliciosos que lleguen desde contenido de la base de datos.
- **Auditoría de dependencias**: `npm audit` y resolver vulnerabilidades.
- **Endurecer supabase/functions/generate-upload-url/index.ts**: actualmente solo valida el `Authorization` header; añadir verificación del JWT (rol/aud) para evitar subidas desde fuera.

## 3. Testing (alcance medio)

- Instalar jest-expo + @testing-library/react-native (`npx expo install jest-expo jest @testing-library/react-native`).
- `"test": "jest"` en `package.json` con preset `jest-expo`.
- Tests útiles para empezar:
  - Geolocalización (formato de coordenadas, distancia).
  - Constantes (`categories`, `districts`, `translations`).
  - `CategoryRow` / `DistrictRow` (render y selección).
  - Validaciones de `spotsService`.

## 4. Mapa general (HECHO)

Implementado en `app/map.tsx`:

- Carga completa en una sola query (`spotsService.getAllForMap`) con exclusión de `No district` y coordenadas `0,0`. Suficiente para ~100-200 spots.
- Iconos por categoría con Ionicons (`constants/CategoryIcons.ts`); ojo: Ionicons NO tiene `mountain`, se usó `binoculars` para "Views".
- Acceso desde el header de Home (`map-outline`); si se deniega el permiso de ubicación se avisa y el mapa se centra en Barcelona.
- Callout por defecto (nombre + categoría) con `onCalloutPress` → `/spot/[id]`.

### Futuro (si la BD crece > ~1000 spots)

- **Bounding box:** consultar solo los spots dentro de la región visible (`onRegionChangeComplete`) usando rangos `.gte/.lte` sobre lat/lon o una RPC que aproveche el índice GIST `idx_spots_location`.
- **Clustering** de markers si se superan unos cientos de puntos simultáneos.

## Notas

- Windows: SDK 54 obligatorio en este proyecto (SDK 57 + AJV v8 falla en Windows; ver `REBUILD_PLAN.md`).
- Sin lint configurado; verificación con `npx tsc --noEmit`.