Te he preparado la versión actualizada y definitiva de tu plan de reconstrucción. He revisado cada sección y corregido todas las referencias a versiones, comandos y dependencias para que estén alineadas con **Expo SDK 54**, que es la elección más estable y segura para tu entorno Windows.

Puedes copiar y pegar este contenido en tu archivo `REBUILD_PLAN.md` para tenerlo completamente listo.

````markdown
# 🎯 GetOutBCN - Rebuild Plan con Expo SDK 54 + SDD

**Fecha de creación:** 5 de Agosto, 2026
**Objetivo:** Crear proyecto limpio desde cero con stack compatible Windows, sin dependencias rotas y con soporte activo.

---

## 📋 Contexto

### Situación Actual

- **Problema:** 2 semanas bloqueado por incompatibilidades Expo SDK 57 + AJV v8 + Windows.
- **Causa raíz:** El CLI moderno de Expo en SDK 56/57 activa un plugin de `expo-router` que depende de `schema-utils` y `ajv`, una combinación que falla en Windows.
- **Solución elegida:** Crear un proyecto nuevo con **Expo SDK 54**, una versión LTS (soporte a largo plazo) que evita este problema y es la recomendada por Expo para desarrollo con Expo Go.

### Lo que YA tienes funcionando

✅ **Base de datos Supabase** configurada y operativa.
✅ **Specs SDD completos** (6 archivos .md en carpeta `specs/`).
✅ **Variables de entorno** (`.env` con keys de Supabase).
✅ **Conocimiento del dominio** (categorías, distritos, spots, favoritos).

### Objetivo Final

- App funcional para **portfolio** que puedas mostrar a recruiters.
- Stack **estable** sin problemas de dependencias.
- Código **limpio** y bien documentado.
- Oportunidad de **aprender Opencode** mientras construyes.

---

## 🚀 Stack Tecnológico

| Componente       | Versión   | Razón                                                           |
| ---------------- | --------- | --------------------------------------------------------------- |
| **Expo SDK**     | `~54.0.0` | Versión estable recomendada, evita problemas de AJV en Windows. |
| **expo-router**  | `~6.0.24` | Compatible con SDK 54 y con el ecosistema moderno.              |
| **React Native** | `0.76.x`  | Incluido en Expo SDK 54.                                        |
| **Node.js**      | `20.18.x` | Requerido por SDK 54.                                           |
| **Supabase**     | `2.111.0` | Backend (Auth + Database + Storage).                            |
| **TypeScript**   | `5.x`     | Type safety y mejor experiencia de desarrollo.                  |

### Dependencias Críticas y sus versiones

La mejor práctica para instalarlas es usando siempre `npx expo install`, lo que garantiza la compatibilidad con el SDK.

```json
{
  "expo": "~54.0.0",
  "expo-router": "~6.0.24",
  "react-native": "0.76.x",
  "react": "18.2.0",
  "@supabase/supabase-js": "2.111.0",
  "react-native-maps": "1.18.0",
  "expo-location": "~18.0.0",
  "expo-image-picker": "~16.0.0",
  "react-native-reanimated": "~3.16.1",
  "react-native-gesture-handler": "~2.20.2"
}
```
````

**⚠️ REGLA DE ORO:** Usar SIEMPRE `npx expo install <paquete>` para garantizar compatibilidad.

---

## 📁 Estructura del Proyecto

```
GetOutBCN-v2/
├── app/                          # Expo Router screens
│   ├── index.tsx                 # Home Screen
│   ├── login.tsx                 # Login Screen
│   ├── signup.tsx                # SignUp Screen
│   ├── add-spot.tsx              # AddSpot Screen (protected)
│   ├── favorites.tsx             # Favorites Screen (protected)
│   ├── profile.tsx               # Profile Screen (protected)
│   ├── category/
│   │   └── [category].tsx        # CategoryList Screen
│   ├── district/
│   │   └── [district].tsx        # DistrictList Screen
│   ├── search/
│   │   └── [category]/
│   │       └── [district].tsx    # CategoryDistrictList Screen
│   └── spot/
│       └── [id].tsx              # SpotDetail Screen
│
├── components/                   # UI Components
│   ├── CategoryRow.tsx
│   ├── DistrictRow.tsx
│   ├── SearchButton.tsx
│   ├── SpotCard.tsx
│   ├── RandomSpotCard.tsx
│   ├── NearbySpotCard.tsx
│   ├── FavoriteButton.tsx
│   ├── MapViewWrapper.tsx
│   ├── SpotForm.tsx
│   ├── SignUpForm.tsx
│   └── ...
│
├── services/                     # Backend logic
│   └── supabase/
│       ├── client.ts             # Supabase client config
│       ├── types.ts              # TypeScript types
│       ├── auth.ts               # Auth service
│       ├── spots.ts              # Spots CRUD
│       ├── favorites.ts          # Favorites service
│       ├── profiles.ts           # Profiles service
│       └── storage.ts            # Storage (images)
│
├── contexts/                     # React Context
│   └── AuthContext.tsx           # Authentication context
│
├── constants/                    # Static data
│   ├── Categories.ts             # Lista de categorías
│   └── Districts.ts              # Lista de distritos
│
├── specs/                        # SDD Specs (ya existen)
│   ├── data.md
│   ├── screens.md
│   ├── navigation.md
│   ├── flows.md
│   ├── components.md
│   └── ui.md
│
├── .env                          # Variables de entorno
├── app.json                      # Expo config
├── metro.config.js               # Metro bundler config
├── tsconfig.json                 # TypeScript config
└── REBUILD_PLAN.md              # Este archivo
```

---

## 🏗️ FASE 1: Setup Inicial (Proyecto Limpio)

### 1.1 Crear Proyecto Base

```bash
# Crear nuevo proyecto con Expo SDK 54
npx create-expo-app@latest GetOutBCN-v2 --template blank-typescript

# Moverse al directorio
cd GetOutBCN-v2
```

### 1.2 Instalar expo-router

```bash
# Instalar expo-router versión compatible con SDK 54
npx expo install expo-router@~6.0.24

# Dependencias requeridas por expo-router
npx expo install react-native-screens react-native-safe-area-context
npx expo install expo-linking expo-constants
```

### 1.3 Configurar Estructura Expo Router

**Crear carpeta `app/`:**

```bash
mkdir app
```

**Crear `app/_layout.tsx`** (root layout):

```tsx
import { Stack } from "expo-router";

export default function RootLayout() {
  return <Stack />;
}
```

**Crear `app/index.tsx`** (home screen temporal):

```tsx
import { View, Text } from "react-native";

export default function HomeScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>GetOutBCN - Home</Text>
    </View>
  );
}
```

### 1.4 Configurar `app.json`

```json
{
  "expo": {
    "name": "GetOutBCN",
    "slug": "GetOutBCN",
    "version": "1.0.0",
    "orientation": "portrait",
    "scheme": "getoutbcn",
    "platforms": ["android", "ios"],
    "plugins": ["expo-router"],
    "experiments": {
      "typedRoutes": false
    }
  }
}
```

### 1.5 Configurar Metro para expo-router

**Crear `metro.config.js`:**

```js
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

module.exports = config;
```

### 1.6 Modificar `package.json`

Actualizar el campo `main`:

```json
{
  "main": "expo-router/entry"
}
```

### 1.7 Instalar Dependencias Core

```bash
# Supabase
npx expo install @supabase/supabase-js

# Maps
npx expo install react-native-maps

# Location
npx expo install expo-location

# Image Picker
npx expo install expo-image-picker

# Reanimated (animaciones)
npx expo install react-native-reanimated

# Gesture Handler
npx expo install react-native-gesture-handler
```

### 1.8 Copiar Archivos del Proyecto Anterior

**Copiar estos archivos/carpetas:**

- `specs/` (completa)
- `.env` (Supabase keys)
- `constants/` (si existe, sino crearla)

### 1.9 Verificar Build Limpio

```bash
npx expo start
```

**Resultado esperado:** App arranca sin errores, muestra "GetOutBCN - Home".

---

## 🔐 FASE 2: Configuración Supabase

### 2.1 Crear Cliente Supabase

**Archivo: `services/supabase/client.ts`**

```typescript
import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";

const supabaseUrl =
  Constants.expoConfig?.extra?.supabaseUrl ||
  process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey =
  Constants.expoConfig?.extra?.supabaseAnonKey ||
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### 2.2 Crear Tipos TypeScript

**Archivo: `services/supabase/types.ts`**

Basado en `specs/data.md`:

```typescript
export type Spot = {
  id: string;
  name: string;
  description: string;
  image_url: string;
  website?: string;
  category: string;
  district: string;
  latitude: number;
  longitude: number;
  tags?: string[];
  created_by: string;
  created_at: string;
};

export type Profile = {
  id: string;
  email: string;
  username?: string;
  avatar_url?: string;
  role?: "user" | "admin";
  created_at: string;
};

export type Favorite = {
  id: string;
  user_id: string;
  spot_id: string;
  created_at: string;
};

export type Category =
  | "Live Music"
  | "Food"
  | "Shops"
  | "Stand Up"
  | "Cinema"
  | "Views"
  | "Silence"
  | "Weird";

export type District =
  | "Ciutat Vella"
  | "Eixample"
  | "Sants-Montjuïc"
  | "Les Corts"
  | "Sarrià-Sant Gervasi"
  | "Gràcia"
  | "Horta-Guinardó"
  | "Nou Barris"
  | "Sant Andreu"
  | "Sant Martí"
  | "No district";
```

### 2.3 Crear Servicios Base

**Archivo: `services/supabase/auth.ts`**

```typescript
import { supabase } from "./client";

export const authService = {
  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getSession() {
    const { data } = await supabase.auth.getSession();
    return data.session;
  },
};
```

**Archivo: `services/supabase/spots.ts`**

```typescript
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
```

**Archivo: `services/supabase/favorites.ts`**

```typescript
import { supabase } from "./client";
import { Favorite } from "./types";

export const favoritesService = {
  async getByUserId(userId: string): Promise<Favorite[]> {
    const { data, error } = await supabase
      .from("favorites")
      .select("*")
      .eq("user_id", userId);
    if (error) throw error;
    return data || [];
  },

  async add(userId: string, spotId: string): Promise<Favorite> {
    const { data, error } = await supabase
      .from("favorites")
      .insert({ user_id: userId, spot_id: spotId })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async remove(userId: string, spotId: string): Promise<void> {
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", userId)
      .eq("spot_id", spotId);
    if (error) throw error;
  },

  async isFavorite(userId: string, spotId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_id", userId)
      .eq("spot_id", spotId)
      .single();
    return !!data && !error;
  },
};
```

**Archivo: `services/supabase/profiles.ts`**

```typescript
import { supabase } from "./client";
import { Profile } from "./types";

export const profilesService = {
  async getById(id: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  },

  async create(profile: Omit<Profile, "created_at">): Promise<Profile> {
    const { data, error } = await supabase
      .from("profiles")
      .insert(profile)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Profile>): Promise<Profile> {
    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};
```

### 2.4 Crear Context de Autenticación

**Archivo: `contexts/AuthContext.tsx`**

```typescript
import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../services/supabase/client';
import { Session, User } from '@supabase/supabase-js';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

**Actualizar `app/_layout.tsx`:**

```tsx
import { Stack } from "expo-router";
import { AuthProvider } from "../contexts/AuthContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack />
    </AuthProvider>
  );
}
```

### 2.5 Crear Constants

**Archivo: `constants/Categories.ts`**

```typescript
export const CATEGORIES = [
  "Live Music",
  "Food",
  "Shops",
  "Stand Up",
  "Cinema",
  "Views",
  "Silence",
  "Weird",
] as const;
```

**Archivo: `constants/Districts.ts`**

```typescript
export const DISTRICTS = [
  "Ciutat Vella",
  "Eixample",
  "Sants-Montjuïc",
  "Les Corts",
  "Sarrià-Sant Gervasi",
  "Gràcia",
  "Horta-Guinardó",
  "Nou Barris",
  "Sant Andreu",
  "Sant Martí",
  "No district",
] as const;
```

---

## 🏠 FASE 3: Pantallas Públicas (Sin Auth)

### 3.1 Home Screen (`app/index.tsx`)

**Referencia:** `specs/screens.md` sección "Home Screen" + `specs/flows.md` sección 1

**Componentes necesarios primero:**

1. `CategoryRow.tsx`
2. `DistrictRow.tsx`
3. `SearchButton.tsx`
4. `RandomSpotCard.tsx`
5. `NearbySpotCard.tsx`

**Lógica principal:**

```typescript
import { useState, useEffect } from 'react';
import { View, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { spotsService } from '../services/supabase/spots';
import CategoryRow from '../components/CategoryRow';
import DistrictRow from '../components/DistrictRow';
import SearchButton from '../components/SearchButton';
import RandomSpotCard from '../components/RandomSpotCard';

export default function HomeScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [randomSpot, setRandomSpot] = useState(null);

  useEffect(() => {
    loadRandomSpot();
  }, []);

  async function loadRandomSpot() {
    const spot = await spotsService.getRandom();
    setRandomSpot(spot);
  }

  function handleSearch() {
    if (selectedCategory && selectedDistrict) {
      router.push(`/search/${selectedCategory}/${selectedDistrict}`);
    } else if (selectedCategory) {
      router.push(`/category/${selectedCategory}`);
    } else if (selectedDistrict) {
      router.push(`/district/${selectedDistrict}`);
    }
  }

  return (
    <ScrollView>
      <CategoryRow
        selectedCategory={selectedCategory}
        onSelect={setSelectedCategory}
      />
      <DistrictRow
        selectedDistrict={selectedDistrict}
        onSelect={setSelectedDistrict}
      />
      <SearchButton
        onPress={handleSearch}
        disabled={!selectedCategory && !selectedDistrict}
      />
      {randomSpot && <RandomSpotCard spot={randomSpot} />}
    </ScrollView>
  );
}
```

**Styling:** Basado en `specs/ui.md` (dark mode industrial, verde tóxico #A9F900)

### 3.2 CategoryList (`app/category/[category].tsx`)

**Referencia:** `specs/screens.md` sección "CategoryList Screen"

```typescript
import { useEffect, useState } from 'react';
import { FlatList } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { spotsService } from '../../services/supabase/spots';
import SpotCard from '../../components/SpotCard';

export default function CategoryListScreen() {
  const { category } = useLocalSearchParams();
  const [spots, setSpots] = useState([]);

  useEffect(() => {
    loadSpots();
  }, [category]);

  async function loadSpots() {
    const data = await spotsService.getByCategory(category as string);
    setSpots(data);
  }

  return (
    <FlatList
      data={spots}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <SpotCard spot={item} />}
    />
  );
}
```

### 3.3 DistrictList (`app/district/[district].tsx`)

Similar a CategoryList pero usando `spotsService.getByDistrict(district)`

### 3.4 CategoryDistrictList (`app/search/[category]/[district].tsx`)

```typescript
import { useEffect, useState } from 'react';
import { FlatList } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { spotsService } from '../../../services/supabase/spots';
import SpotCard from '../../../components/SpotCard';

export default function CategoryDistrictListScreen() {
  const { category, district } = useLocalSearchParams();
  const [spots, setSpots] = useState([]);

  useEffect(() => {
    loadSpots();
  }, [category, district]);

  async function loadSpots() {
    const data = await spotsService.getByCategoryAndDistrict(
      category as string,
      district as string
    );
    setSpots(data);
  }

  return (
    <FlatList
      data={spots}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <SpotCard spot={item} />}
    />
  );
}
```

### 3.5 SpotDetail (`app/spot/[id].tsx`)

**Referencia:** `specs/screens.md` sección "SpotDetail Screen"

**Componentes:**

- `ImageHeader`
- `SpotInfo`
- `CategoryTag`
- `DistrictButton`
- `MapViewWrapper`
- `FavoriteButton`

```typescript
import { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { spotsService } from '../../services/supabase/spots';
import { favoritesService } from '../../services/supabase/favorites';
import { useAuth } from '../../contexts/AuthContext';
import ImageHeader from '../../components/ImageHeader';
import SpotInfo from '../../components/SpotInfo';
import MapViewWrapper from '../../components/MapViewWrapper';
import FavoriteButton from '../../components/FavoriteButton';

export default function SpotDetailScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [spot, setSpot] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    loadSpot();
    if (user) checkFavorite();
  }, [id, user]);

  async function loadSpot() {
    const data = await spotsService.getById(id as string);
    setSpot(data);
  }

  async function checkFavorite() {
    const fav = await favoritesService.isFavorite(user!.id, id as string);
    setIsFavorite(fav);
  }

  async function toggleFavorite() {
    if (!user) return;

    if (isFavorite) {
      await favoritesService.remove(user.id, id as string);
    } else {
      await favoritesService.add(user.id, id as string);
    }
    setIsFavorite(!isFavorite);
  }

  if (!spot) return null;

  return (
    <ScrollView>
      <ImageHeader imageUrl={spot.image_url} />
      <SpotInfo
        name={spot.name}
        description={spot.description}
        website={spot.website}
      />
      <MapViewWrapper
        latitude={spot.latitude}
        longitude={spot.longitude}
      />
      {user && (
        <FavoriteButton
          isFavorite={isFavorite}
          onToggle={toggleFavorite}
        />
      )}
    </ScrollView>
  );
}
```

---

## 🔐 FASE 4: Autenticación

### 4.1 Login Screen (`app/login.tsx`)

**Referencia:** `specs/screens.md` sección "Login Screen" + `specs/flows.md` sección 6

```typescript
import { useState } from 'react';
import { View, TextInput, Button, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { authService } from '../services/supabase/auth';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleLogin() {
    try {
      await authService.signIn(email, password);
      router.replace('/');
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {error && <Text style={{ color: 'red' }}>{error}</Text>}
      <Button title="Login" onPress={handleLogin} />
      <Button
        title="Crear cuenta"
        onPress={() => router.push('/signup')}
      />
    </View>
  );
}
```

### 4.2 SignUp Screen (`app/signup.tsx`)

**Referencia:** `specs/flows.md` sección 6.3 (Register Flow)

**Validaciones:**

- Email válido
- Password ≥ 6 caracteres
- Password y confirmPassword coinciden

```typescript
import { useState } from 'react';
import { View, TextInput, Button, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { authService } from '../services/supabase/auth';
import { profilesService } from '../services/supabase/profiles';

export default function SignUpScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSignUp() {
    setError('');

    // Validations
    if (!email.includes('@')) {
      setError('Email inválido');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    try {
      // Create auth user
      const { user } = await authService.signUp(email, password);

      // Create profile
      await profilesService.create({
        id: user!.id,
        email: email
      });

      router.replace('/');
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        placeholder="Confirmar contraseña"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
      {error && <Text style={{ color: '#D32F2F' }}>{error}</Text>}
      <Button title="Crear cuenta" onPress={handleSignUp} />
      <Button
        title="Ya tengo cuenta"
        onPress={() => router.push('/login')}
      />
    </View>
  );
}
```

### 4.3 Profile Screen (`app/profile.tsx`)

**Protected:** Requiere autenticación

```typescript
import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/supabase/auth';

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();

  async function handleLogout() {
    await authService.signOut();
    router.replace('/');
  }

  if (!user) {
    router.replace('/login');
    return null;
  }

  return (
    <View style={{ padding: 20 }}>
      <Text>Email: {user.email}</Text>
      <Button title="Cerrar sesión" onPress={handleLogout} />
    </View>
  );
}
```

---

### 4.4 Login social con Google (solo Android)

**Referencia:** `specs/flows.md` sección 6.4 (Social Login) y `components.md` (SocialLoginButton).

#### Requisitos técnicos

- La autenticación social **solo funciona en development builds**, no en Expo Go.
- Ya tienes las credenciales configuradas en Supabase (Google Provider activado) y en tu `.env` (`EXPO_PUBLIC_SUPABASE_URL` y `EXPO_PUBLIC_SUPABASE_ANON_KEY` son suficientes).

#### Librería recomendada

`expo-auth-session` + `expo-web-browser` (ambas de Expo) + `@supabase/supabase-js` (ya instalada). Esta es la combinación oficial y más documentada.

#### Pasos a seguir en el Sprint 4

1. **Instalar las dependencias necesarias:**

   ```bash
   npx expo install expo-auth-session expo-web-browser
   ```

2. **Configurar `expo-web-browser` en `app.json`:**

   ```json
   {
     "expo": {
       // ... tu configuración existente
       "plugins": [
         [
           "expo-web-browser",
           {
             "experimentalLauncherActivity": false
           }
         ]
       ]
     }
   }
   ```

3. **Crear el servicio de autenticación social:**
   Crea `services/supabase/social-auth.ts`:

   ```typescript
   import * as WebBrowser from "expo-web-browser";
   import * as AuthSession from "expo-auth-session";
   import { supabase } from "./client";

   WebBrowser.maybeCompleteAuthSession();

   export const socialAuthService = {
     async signInWithGoogle(): Promise<void> {
       const redirectUri = AuthSession.makeRedirectUri({
         scheme: "getoutbcn", // Debe coincidir con el scheme en app.json
       });

       const { data, error } = await supabase.auth.signInWithOAuth({
         provider: "google",
         options: {
           redirectTo: redirectUri,
           skipBrowserRedirect: true,
         },
       });

       if (error) throw error;
       if (!data.url)
         throw new Error("No se pudo obtener la URL de autenticación");

       const result = await WebBrowser.openAuthSessionAsync(
         data.url,
         redirectUri,
       );

       if (result.type === "success") {
         // La sesión se actualiza automáticamente en el cliente de Supabase
         // gracias a la configuración de redirectTo y la URL de callback.
         // Podemos verificar la sesión con supabase.auth.getSession()
       } else {
         throw new Error("Autenticación cancelada o fallida");
       }
     },
   };
   ```

4. **Añadir el botón de Google en `app/login.tsx`:**

   ```tsx
   import { socialAuthService } from "../services/supabase/social-auth";

   // ... dentro del componente
   async function handleGoogleSignIn() {
     try {
       await socialAuthService.signInWithGoogle();
       router.replace("/");
     } catch (error) {
       setError(error.message);
     }
   }

   // ... en el render
   <Button title="Iniciar sesión con Google" onPress={handleGoogleSignIn} />;
   ```

5. **Proteger rutas y ajustar comportamiento:**
   - `add-spot` y `profile` deben redirigir a `login` si `!user`.
   - En SpotDetail, `FavoriteButton` solo visible si `user` existe.
   - En Home, el botón "Iniciar sesión" solo aparece si `!user`; si `user` existe, mostrar "Añadir spot" y un acceso a `profile`.

#### Construcción del build y gestión del tiempo

- **El build debe ser iniciado por el usuario** (no por OpenCode). Una vez que hayas terminado la implementación, notifica al usuario para que pueda ejecutar el build.
- **Durante la espera del build** (puede tardar horas en el plan gratuito de EAS), se recomienda:
  - Revisar el código generado para detectar posibles mejoras.
  - Preparar datos de prueba en Supabase (insertar spots, categorías, etc.) para verificar la funcionalidad completa tras el build.
  - Documentar cualquier cambio o decisión tomada durante el sprint.

#### Pruebas obligatorias

- Después del build, instala el APK en un dispositivo físico y prueba el flujo completo de login con Google.
- **Importante:** El flujo **fallará en Expo Go**, es normal y esperado. Solo funciona en development builds.

---

## 📝 FASE 5: Pantallas Autenticadas

### 5.1 AddSpot Screen (`app/add-spot.tsx`)

**Referencia:** `specs/screens.md` sección "AddSpot Screen" + `specs/flows.md` sección 7

**Protected:** Requiere autenticación

**Componentes:**

- `SpotForm`
- `ImageUpload`
- `CategoryDropdown`
- `DistrictDropdown`
- `LocationButton`

```typescript
import { useState } from 'react';
import { View, TextInput, Button } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { spotsService } from '../services/supabase/spots';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';

export default function AddSpotScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [district, setDistrict] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [imageUrl, setImageUrl] = useState('');

  if (!user) {
    router.replace('/login');
    return null;
  }

  async function handleGetLocation() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;

    const location = await Location.getCurrentPositionAsync({});
    setLatitude(location.coords.latitude);
    setLongitude(location.coords.longitude);
  }

  async function handleImagePick() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1
    });

    if (!result.canceled) {
      // TODO: Upload to Supabase Storage
      // For now, use local URI
      setImageUrl(result.assets[0].uri);
    }
  }

  async function handleSubmit() {
    if (!latitude || !longitude) {
      alert('Por favor, obtén la ubicación primero');
      return;
    }

    const newSpot = await spotsService.create({
      name,
      description,
      category,
      district,
      latitude,
      longitude,
      image_url: imageUrl,
      created_by: user.id
    });

    router.push(`/spot/${newSpot.id}`);
  }

  return (
    <View style={{ padding: 20 }}>
      <TextInput placeholder="Nombre" value={name} onChangeText={setName} />
      <TextInput placeholder="Descripción" value={description} onChangeText={setDescription} />
      <Button title="Seleccionar imagen" onPress={handleImagePick} />
      <Button title="Obtener ubicación" onPress={handleGetLocation} />
      <Button title="Publicar" onPress={handleSubmit} />
    </View>
  );
}
```

### 5.2 Favorites Screen (`app/favorites.tsx`)

**Protected:** Requiere autenticación

```typescript
import { useEffect, useState } from 'react';
import { FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { favoritesService } from '../services/supabase/favorites';
import { spotsService } from '../services/supabase/spots';
import SpotCard from '../components/SpotCard';

export default function FavoritesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [favoriteSpots, setFavoriteSpots] = useState([]);

  useEffect(() => {
    if (!user) {
      router.replace('/login');
      return;
    }
    loadFavorites();
  }, [user]);

  async function loadFavorites() {
    const favorites = await favoritesService.getByUserId(user!.id);
    const spotIds = favorites.map(f => f.spot_id);

    // Fetch all spots
    const spots = await Promise.all(
      spotIds.map(id => spotsService.getById(id))
    );

    setFavoriteSpots(spots.filter(Boolean));
  }

  return (
    <FlatList
      data={favoriteSpots}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <SpotCard spot={item} />}
    />
  );
}
```

---

## 🎨 FASE 6: Styling & Animaciones

### 6.1 Crear Theme Constants

**Archivo: `constants/Theme.ts`**

Basado en `specs/ui.md`:

```typescript
export const Colors = {
  background: "#131313",
  surface: "#101508",
  surfaceLow: "#1C1B1B",
  surfaceHigh: "#2A2A2A",
  surfaceHighest: "#353534",

  primary: "#A9F900",
  primaryDim: "#94DB00",
  onPrimary: "#121F00",

  textPrimary: "#FFFFFF",
  textSecondary: "#C1CAAD",
  textMuted: "#8B947A",

  error: "#FF4D4D",
  warning: "#FFCC00",
};

export const Typography = {
  titleXL: { fontSize: 48, fontWeight: "900" as const },
  titleLG: { fontSize: 32, fontWeight: "800" as const },
  titleLGMobile: { fontSize: 24, fontWeight: "800" as const },
  bodyMain: { fontSize: 16, fontWeight: "400" as const },
  bodyHighlight: { fontSize: 18, fontWeight: "500" as const },
  industrialLabel: {
    fontSize: 12,
    fontWeight: "700" as const,
    letterSpacing: 0.1,
  },
};

export const Spacing = {
  horizontalPadding: 16,
  verticalPadding: 12,
  cardPadding: 12,
  fieldSpacing: 16,
};

export const BorderRadius = {
  card: 12,
  button: 12,
  tag: 20,
};
```

### 6.2 Implementar Auto-Scrolling Rows

**En `components/CategoryRow.tsx`:**

Usar `react-native-reanimated` para auto-scroll infinito hacia la izquierda

**En `components/DistrictRow.tsx`:**

Usar `react-native-reanimated` para auto-scroll infinito hacia la derecha

### 6.3 Micro-Interacciones

**Button Press:**

- Scale to 0.97 on press
- Spring back animation

**Favorite Toggle:**

- Quick scale pop (1.0 → 1.2 → 1.0)

---

## 🧪 FASE 7: Testing & Deployment

### 7.1 Testing Local

```bash
# Android
npx expo run:android

# iOS (solo macOS)
npx expo run:ios
```

### 7.2 Verificar Funcionalidad

**Checklist:**

- [ ] Navegación entre pantallas
- [ ] Login/SignUp funcional
- [ ] Crear spot
- [ ] Ver spots por categoría/distrito
- [ ] Favoritos
- [ ] Logout
- [ ] MapView
- [ ] Image picker
- [ ] Location

### 7.3 Build Production (Opcional)

```bash
# Instalar EAS CLI
npm install -g eas-cli

# Login
eas login

# Configure
eas build:configure

# Build Android
eas build --platform android --profile production
```

---

## 📊 Orden de Ejecución Recomendado (Sprints)

### Sprint 1: Foundation (3-4 horas)

- [ ] Crear proyecto Expo SDK 54
- [ ] Instalar dependencias core
- [ ] Configurar expo-router
- [ ] Configurar Supabase client
- [ ] Crear tipos TypeScript
- [ ] Crear servicios base (auth, spots, favorites, profiles)
- [ ] Crear AuthContext
- [ ] Verificar build limpio

### Sprint 2: Home + Navegación Básica (4-5 horas)

- [ ] Componente CategoryRow (auto-scroll)
- [ ] Componente DistrictRow (auto-scroll)
- [ ] Componente SearchButton
- [ ] Home screen completo
- [ ] CategoryList screen
- [ ] DistrictList screen
- [ ] CategoryDistrictList screen
- [ ] SpotCard component

### Sprint 3: SpotDetail (2-3 horas)

- [ ] ImageHeader component
- [ ] SpotInfo component
- [ ] CategoryTag component
- [ ] DistrictButton component
- [ ] MapViewWrapper component
- [ ] FavoriteButton component
- [ ] SpotDetail screen completo

### Sprint 4: Auth (2-3 horas)

- [ ] Login screen
- [ ] SignUp screen + validaciones
- [ ] Profile screen
- [ ] Protected routes logic
- [ ] Logout flow

### Sprint 5: AddSpot (3-4 horas)

- [ ] SpotForm component
- [ ] ImageUpload (Supabase Storage)
- [ ] CategoryDropdown
- [ ] DistrictDropdown
- [ ] LocationButton (expo-location)
- [ ] AddSpot screen completo
- [ ] Submit flow

### Sprint 6: Features Avanzadas (3-4 horas)

- [ ] Favorites screen
- [ ] RandomSpotCard
- [ ] NearbySpotCard (location-based)
- [ ] Toggle favorite logic
- [ ] Fetch favorites

### Sprint 7: Polish (2-3 horas)

- [ ] Aplicar theme (colors, typography)
- [ ] Animaciones CategoryRow/DistrictRow
- [ ] Micro-interacciones (button press, favorite toggle)
- [ ] Error handling
- [ ] Loading states
- [ ] Final styling

**Tiempo Total Estimado: 19-26 horas**

---

## 📚 Referencias Clave

Durante la construcción, usa estos specs como guía:

| Archivo               | Propósito                                      |
| --------------------- | ---------------------------------------------- |
| `specs/data.md`       | Estructura DB, tipos TypeScript, relaciones    |
| `specs/screens.md`    | Qué hace cada pantalla, componentes requeridos |
| `specs/navigation.md` | Rutas entre pantallas, params                  |
| `specs/flows.md`      | Lógica detallada de cada interacción           |
| `specs/components.md` | Props y responsabilidades de componentes       |
| `specs/ui.md`         | Colores, tipografía, animaciones, diseño       |

---

## ⚠️ Reglas Críticas

### 1. NUNCA usar npm install directo

**SIEMPRE:**

```bash
npx expo install <paquete>
```

### 2. Verificar compatibilidad SDK 54

Antes de instalar cualquier paquete, confirmar que es compatible con Expo SDK 54

### 3. No mezclar versiones

No instalar paquetes de Expo SDK 56/57 en proyecto SDK 54

### 4. Usar TypeScript strict

Aprovechar tipos para evitar errores

### 5. RLS en Supabase

Verificar que Row Level Security esté configurada correctamente

---

## 🎯 Objetivo Final

### Para Recruiters:

**App funcional** que demuestra:

- ✅ React Native + Expo
- ✅ TypeScript
- ✅ Supabase (Backend as a Service)
- ✅ Authentication
- ✅ CRUD operations
- ✅ Maps integration
- ✅ Image upload
- ✅ Location services
- ✅ Routing (expo-router)
- ✅ State management (Context)
- ✅ Clean architecture (services layer)
- ✅ SDD methodology

### Documentación:

- Specs completos en carpeta `specs/`
- Plan de rebuild (este archivo)
- Código limpio y comentado

---

## 🚀 Próximos Pasos

Cuando estés listo para empezar:

1. **Abrir OpenCode** en el proyecto
2. **Decir:** "Empecemos con Sprint 1 del REBUILD_PLAN.md"
3. **Seguir sprints** uno por uno
4. **Probar cada fase** antes de continuar

---

## 📞 Soporte

Si encuentras problemas:

1. **Revisar este plan** primero
2. **Consultar specs** correspondientes
3. **Verificar versiones** de dependencias
4. **Leer docs de Expo SDK 54:** https://docs.expo.dev/versions/v54.0.0/

---

**Última actualización:** 5 de Agosto, 2026  
**Versión:** 2.0  
**Estado:** ✅ Listo para ejecutar

```

```
