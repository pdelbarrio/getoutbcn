# Data Specification (SDD)

This document defines all data models, tables, relations, and constraints used in the GetOutBCN application.  
The backend is powered by Supabase (PostgreSQL + Auth + Storage).

---

# 1. Overview of Data Models

The application uses four main entities:

- **Spot** — a place in Barcelona created by users.
- **Profile** — user profile associated with Supabase Auth.
- **Favorite** — a relation between a user and a spot.
- **Comment** — a comment posted by a user on a spot (optional anonymous).

All data is stored in Supabase tables with Row Level Security (RLS) enabled.

---

# 2. Tables

## 2.1 `spots`

Stores all spots created by users.

### Columns

| Name          | Type        | Required            | Description                        |
| ------------- | ----------- | ------------------- | ---------------------------------- |
| `id`          | uuid (PK)   | Yes                 | Unique identifier for the spot     |
| `name`        | text        | Yes                 | Spot name                          |
| `description` | text        | Yes                 | Spot description                   |
| `image_url`   | text        | Yes                 | URL of the spot image              |
| `website`     | text        | No                  | Optional external link             |
| `category`    | text        | Yes                 | Category name (string)             |
| `district`    | text        | Yes                 | District name (string)             |
| `latitude`    | float8      | Yes                 | Spot latitude                      |
| `longitude`   | float8      | Yes                 | Spot longitude                     |
| `created_by`  | uuid        | Yes                 | User ID (references `profiles.id`) |
| `created_at`  | timestamptz | Yes (default now()) | Creation timestamp                 |

### Constraints

- `created_by` must reference an existing profile.
- Only the creator can update/delete the spot (RLS).

---

## 2.2 `profiles`

Stores user profile information.

### Columns

| Name         | Type        | Required            | Description                   |
| ------------ | ----------- | ------------------- | ----------------------------- |
| `id`         | uuid (PK)   | Yes                 | Matches Supabase Auth user ID |
| `email`      | text        | Yes                 | User email                    |
| `username`   | text        | No                  | Optional display name         |
| `avatar_url` | text        | No                  | Optional profile picture      |
| `created_at` | timestamptz | Yes (default now()) | Creation timestamp            |

### Constraints

- `id` must match the authenticated user ID.
- Users can only update their own profile (RLS).

---

## 2.3 `favorites`

Stores user favorites (many‑to‑many relation between profiles and spots).

### Columns

| Name         | Type        | Required            | Description              |
| ------------ | ----------- | ------------------- | ------------------------ |
| `id`         | uuid (PK)   | Yes                 | Unique identifier        |
| `user_id`    | uuid        | Yes                 | References `profiles.id` |
| `spot_id`    | uuid        | Yes                 | References `spots.id`    |
| `created_at` | timestamptz | Yes (default now()) | Creation timestamp       |

### Constraints

- A user cannot favorite the same spot twice (unique constraint).
- Users can only modify their own favorites (RLS).

---

## 2.4 `comments`

Stores user comments on spots.

### Columns

| Name           | Type        | Required            | Description                    |
| -------------- | ----------- | ------------------- | ------------------------------ |
| `id`           | uuid (PK)   | Yes                 | Unique identifier              |
| `spot_id`      | uuid        | Yes                 | References `spots.id`          |
| `user_id`      | uuid        | Yes                 | References `profiles.id`       |
| `content`      | text        | Yes                 | Comment body (max 200 chars)   |
| `is_anonymous` | boolean     | Yes (default false) | Hides the author if `true`     |
| `created_at`   | timestamptz | Yes (default now()) | Creation timestamp             |
| `updated_at`   | timestamptz | Yes (default now()) | Last update timestamp          |

### Constraints

- `content` max length **200 characters**.
- `user_id` is set automatically by the trigger `set_comments_user_id` (`auth.uid()`).
- `updated_at` is refreshed by the trigger `update_comments_updated_at`.
- Authors can only update/delete their own comments (RLS).

### Triggers

- **`set_comments_user_id`:** assigns `user_id = auth.uid()` when inserting a comment.
- **`update_comments_updated_at`:** sets `updated_at = now()` on every update.

### RPC

- **`get_comments_for_spot(p_spot_id uuid)`:** returns the comments of a spot with the author's `username` and `avatar_url` (JOIN with `profiles`). When `is_anonymous = true`, `username` is returned as `NULL`.

---

# 3. Relations

### Spot → Profile

- `spots.created_by` → `profiles.id`
- One profile can create many spots.

### Profile → Favorites

- `favorites.user_id` → `profiles.id`
- One profile can have many favorites.

### Spot → Favorites

- `favorites.spot_id` → `spots.id`
- One spot can be favorited by many users.

### Spot → Comments

- `comments.spot_id` → `spots.id`
- One spot can have many comments.

### Profile → Comments

- `comments.user_id` → `profiles.id`
- One profile can author many comments.

---

# 4. Static Data

### Categories (string list)

- Live Music
- Food
- Shops
- Stand Up
- Cinema
- Views
- Silence
- Weird
- Bars
- Art

### Districts (string list)

- Ciutat Vella
- Eixample
- Sants-Montjuïc
- Les Corts
- Sarrià-Sant Gervasi
- Gràcia
- Horta-Guinardó
- Nou Barris
- Sant Andreu
- Sant Martí
- No district

---

# 5. Data Access Patterns

### Spots

- Fetch all spots
- Fetch by category
- Fetch by district
- Fetch by category + district
- Fetch random spot
- Fetch nearby spot (distance calculation)

### Favorites

- Add favorite
- Remove favorite
- Fetch all favorites for user
- Check if spot is favorited

### Profiles

- Fetch profile
- Update profile
- Update username (`updateUsername` in `profilesService`)

### Comments

- Fetch comments for a spot (RPC `get_comments_for_spot`)
- Create comment (inserts with `is_anonymous`)
- Update comment
- Delete comment

---

# 6. Storage

### Spot Images

Stored in:
supabase.storage.from("spots")

### Avatar Images

Stored in:
supabase.storage.from("avatars")

---

# 7. Security (RLS)

### Spots

- Anyone can read
- Only the creator can update/delete **unless the user has the `admin` role**
- Admin users can update/delete any spot

### Favorites

- Only the owner can read/write their favorites

### Profiles

- Only the owner can read/write their profile
- Admin users can read all profiles (optional)

### Comments

- Any authenticated user can read comments (any spot) → `select`
- Any authenticated user can create comments → `insert`
- Only the author can update/delete their own comments → `update` / `delete`

### RLS activo

Row Level Security está **activa** en `profiles`, `spots`, `favorites` y `comments`, con políticas granulares `SELECT` / `INSERT` / `UPDATE` / `DELETE` (incluido el rol `admin`, que edita/borra cualquier fila de `spots` y `profiles`).

> **Nota (GRANT):** las tablas creadas con `CREATE TABLE` desde el SQL Editor no reciben `GRANT` por defecto. Si aparece `permission denied for table <tabla>`, ejecutar:
> `GRANT SELECT, INSERT, UPDATE, DELETE ON <tabla> TO anon, authenticated;`

# 8. Types (TypeScript)

### Spot

```ts
type Spot = {
  id: string;
  name: string;
  description: string;
  image_url: string;
  website?: string;
  category: string;
  district: string; // "No district" allowed
  latitude: number;
  longitude: number;
  tags?: string[]; // optional, max 3 tags
  created_by: string;
  created_at: string;
};

type Profile = {
  id: string;
  email: string;
  username?: string;
  avatar_url?: string;
  role?: "user" | "admin"; // admin can edit/delete any spot
  created_at: string;
};

type Favorite = {
  id: string;
  user_id: string;
  spot_id: string;
  created_at: string;
};

type Comment = {
  id: string;
  spot_id: string;
  user_id: string;
  content: string; // max 200 chars
  created_at: string;
  updated_at: string;
  is_anonymous: boolean; // default false
  username?: string | null; // NULL when is_anonymous = true
  avatar_url?: string | null;
};
```
