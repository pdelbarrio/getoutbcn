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
