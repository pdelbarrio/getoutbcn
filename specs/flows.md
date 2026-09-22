# User Flows Specification (SDD)

This document defines all user interaction flows in the GetOutBCN mobile application.

---

# 1. Home Screen Flows

## 1.1 Select Category

**Trigger:** User taps a category in the CategoryRow  
**State changes:**

- `selectedCategory = category`

**Notes:**

- CategoryRow auto-scrolls left continuously
- Selected category is visually highlighted

---

## 1.2 Select District

**Trigger:** User taps a district in the DistrictRow  
**State changes:**

- `selectedDistrict = district`

**Notes:**

- DistrictRow auto-scrolls right continuously
- “No district” is a valid option (used for virtual spots)

---

## 1.3 Combined Search Flow (“CERCAR” button)

**Trigger:** User taps SearchButton  
**Logic:**

- If `selectedCategory` only → navigate to `/category/[category]`
- If `selectedDistrict` only → navigate to `/district/[district]`
- If both selected → navigate to `/search/[category]/[district]`
- If neither selected → no navigation (button disabled)

---

## 1.4 Random Spot Flow

**Trigger:** Home screen loads  
**Steps:**

1. Fetch random spot from Supabase
2. Display RandomSpotCard
3. Tap → navigate to `/spot/[id]`

---

## 1.5 Nearby Spot Flow

**Trigger:** Home screen loads  
**Steps:**

1. Request location permission
2. If granted → fetch nearby spot
3. Display NearbySpotCard
4. Tap → navigate to `/spot/[id]`

---

## 1.6 Header Action Flow

**Trigger:** User taps header button  
**Logic:**

- If user is not authenticated → navigate to `/login`
- If user is authenticated → navigate to `/add-spot`

---

# 2. CategoryList Flow

## 2.1 Load Spots by Category

**Trigger:** Navigate to `/category/[category]`  
**Steps:**

1. Read `category` from route params
2. Fetch spots where `category = param`
3. Render SpotCard list

**Tap Spot:** navigate to `/spot/[id]`

---

# 3. DistrictList Flow

## 3.1 Load Spots by District

**Trigger:** Navigate to `/district/[district]`  
**Steps:**

1. Read `district` from route params
2. Fetch spots where `district = param`
3. Render SpotCard list

**Tap Spot:** navigate to `/spot/[id]`

---

# 4. CategoryDistrictList Flow

## 4.1 Combined Filter

**Trigger:** Navigate to `/search/[category]/[district]`  
**Steps:**

1. Read both params
2. Fetch spots where `category = param` AND `district = param`
3. Render SpotCard list

**Tap Spot:** navigate to `/spot/[id]`

---

# 5. SpotDetail Flow

## 5.1 Load Spot Details

**Trigger:** Navigate to `/spot/[id]`  
**Steps:**

1. Fetch spot by ID
2. Fetch favorite status
3. Render full details

---

## 5.2 Navigate to District

**Trigger:** User taps DistrictButton  
**Action:** navigate to `/district/[district]`

---

## 5.3 Toggle Favorite

**Trigger:** User taps FavoriteButton  
**Logic:**

- If not favorite → insert into `favorites`
- If favorite → delete from `favorites`

**Constraints:**

- Only authenticated users can favorite
- Admin users behave like normal users for favorites

---

## 5.4 Open Website

**Trigger:** User taps website link  
**Action:** open external browser

---

## 5.5 Create Comment

**Trigger:** Authenticated user publishes a comment in `CommentsSection`  
**Steps:**

1. Write text (max **200 characters**).
2. Optionally toggle the "Comentar com a anònim" switch → `isAnonymous = true`.
3. Tap "Enviar".
4. `commentsService.create(spotId, content, isAnonymous)` inserts into `comments` (the DB assigns `user_id` via the trigger `set_comments_user_id`, and sets `is_anonymous`).
5. On success the composer clears, `isAnonymous` resets to `false`, and the list reloads.

**Constraints:**

- Requires authentication (the composer is hidden for logged-out users).
- Content must be non-empty and ≤ 200 chars.
- Counter `n/200` is shown next to the input.

---

## 5.6 Edit / Delete Comment (own comments only)

**Trigger:** User is the author of a comment (`user.id === comment.user_id`)  
**Edit — Steps:**

1. Tap the pencil icon → inline `TextInput` prefilled with the content.
2. Edit and tap "desar"; `commentsService.update(commentId, content)` updates and the list reloads.

**Delete — Steps:**

1. Tap the trash icon → `Alert` confirmation.
2. On confirm, `commentsService.remove(commentId)` deletes and the list updates locally.

**Constraints:**

- Only the author can edit/delete (RLS).
- Deleting requires explicit confirmation.

---

## 5.7 "Com arribar-hi" (Directions)

**Trigger:** User taps the "Com arribar-hi" button on SpotDetail  
**Steps:**

1. Build the Google Maps directions URL:
   `https://www.google.com/maps/dir/?api=1&destination=<lat>,<lon>&travelmode=walking`
2. Check support with `Linking.canOpenURL`.
3. Open it with `Linking.openURL`.
4. On error (or no coordinates) show an `Alert`.

---

## 5.8 Share Spot

**Trigger:** User taps the share icon on `SpotDetailHeader`  
**Steps:**

1. Compose the message:
   - Spot name
   - First line of the description (truncated to 120 chars), if present
   - Google Maps link (`https://www.google.com/maps/search/?api=1&query=<lat>,<lon>`), only if the spot has valid coordinates
2. Open the native share sheet (`Share.share`).

---

# 6. Login Flow

## 6.1 Google Login

**Trigger:** User taps GoogleLoginButton  
**Steps:**

1. Start Supabase OAuth
2. On success → create/update profile
3. If login was triggered from Home header → navigate to `/add-spot`
4. Otherwise → navigate back

---

## 6.2 Email Login

**Trigger:** User submits EmailLoginForm  
**Steps:**

1. Validate email/password
2. Authenticate via Supabase
3. Navigate back or to AddSpot depending on context

---

## 6.3 Register Flow

**Trigger:** User toggles to register mode or navigates to `/signup`  
**Steps:**

1. User enters:
   - email
   - password
   - confirmPassword
2. Validate fields:
   - Email format is valid
   - Password has minimum length (≥ 6 chars)
   - Password and confirmPassword match
3. Call Supabase:
   - `auth.signUp({ email, password })`
4. Supabase returns:
   - `session`
   - `user.id` (UUID)
5. Insert profile row:
   - `profiles.id = user.id`
   - `profiles.email = email`
6. AuthContext stores:
   - `session`
   - `user`
7. Navigate to:
   - `/home`

**Errors:**

- Email already registered
- Weak password
- Passwords do not match
- Invalid email
- Generic Supabase error

---

# 7. AddSpot Flow

## 7.1 Fill Spot Form

**Fields:**

- name
- description
- website (optional)
- category
- district (including “No district”)
- tags (optional, max 3)
- latitude
- longitude
- image_url

---

## 7.2 Upload Image

**Trigger:** User taps ImageUpload  
**Steps:**

1. Open image picker
2. Upload to Supabase Storage/Cloudinary Storage
3. Return URL to form

---

## 7.3 Get Location

**Trigger:** User taps LocationButton  
**Steps:**

1. Request permission
2. Fetch coordinates
3. Fill latitude/longitude fields

---

## 7.4 Publish Spot

**Trigger:** User taps PublishButton  
**Steps:**

1. Validate form
2. Insert into `spots` table
3. Navigate to `/spot/[id]`

**Admin Note:**  
Admins can later edit/delete any spot.

---

# 8. Favorites Flow

## 8.1 Load Favorites

**Trigger:** Navigate to `/favorites`  
**Steps:**

1. Fetch favorites for authenticated user
2. Fetch corresponding spots
3. Render SpotCard list

---

## 8.2 Remove Favorite

**Trigger:** User taps FavoriteButton on a favorite spot  
**Action:** delete from `favorites`

---

## 8.3 Navigate to Spot

**Trigger:** User taps SpotCard  
**Action:** navigate to `/spot/[id]`

---

# 9. Profile Flow

## 9.1 Load Profile

**Trigger:** Navigate to `/profile`  
**Steps:**

1. Fetch profile
2. Render avatar + email + username

---

## 9.2 Logout

**Trigger:** User taps LogoutButton  
**Action:** sign out via Supabase → navigate to Home

---

## 9.3 Edit Nickname

**Trigger:** User edits the `username` field on the Profile screen  
**Steps:**

1. Type the new nickname (auto-capitalization off, counter `n/20` shown).
2. Tap "Guardar".
3. Validation:
   - Length > 20 → `Alert` error (nicknameTooLong).
   - Contains invalid characters (only `a-z`, `A-Z`, `0-9`, `-`, `_` allowed; no spaces) → `Alert` error (nicknameInvalidChars).
   - Empty text → saved literally as `"Anònim"`.
4. On success: `profilesService.updateUsername(user.id, value)` → `refreshProfile()` → confirmation `Alert`.

**Notes:**

- The change is global and immediate: `AuthContext` stores the updated `profile`, so every screen using `useAuth()` (e.g. comments showing the author name) reflects it without logging out.

---

# 10. Admin Flow

## 10.1 Edit Any Spot

**Trigger:** Admin user opens SpotDetail  
**Action:** admin sees “Edit Spot” button

## 10.2 Delete Any Spot

**Trigger:** Admin user taps delete  
**Action:** remove from `spots` table

**Note:**  
Admins bypass RLS restrictions.

---

# 11. Lazy Loading / Pagination in Listings

Applied to the listing screens (category, district, search, tag, favorites).

**Trigger:** Navigate to a listing screen  
**Steps:**

1. Initial fetch of the first page: `PAGE_SIZE = 15`, `count: "exact"` (total number of spots).
2. Render the loaded `SpotCard`s; while more pages remain, show a loading footer.
3. Scroll to the bottom → `onEndReached` triggers the fetch of the next page (incremental `from`/`to` range) and appends the new items.
4. Pull-to-refresh reloads the first page and resets the pagination state.
5. When there are no results, an empty state is shown.

**Related:**

- Hook: `hooks/usePaginatedSpots.ts`.
- Nearby listing uses the RPC `get_nearby_spots` (ordered by distance, cap 50).

---
