# Screens Specification (SDD)

This document defines all screens in the GetOutBCN mobile application.  
The structure follows Expo Router conventions.

---

## Home Screen (`app/index.tsx`)

### Purpose

Main landing screen where users can:

- Select a category
- Select a district
- Perform a combined search
- View a random spot
- View a nearby random spot (if location permission is granted)
- Access login or add-spot functionality

### Components

- Header
- CategoryRow (auto-scrolling left)
- DistrictRow (auto-scrolling right)
- SearchButton (“CERCAR”)
- RandomSpotCard
- NearbySpotCard

### State

- `selectedCategory: string | null`
- `selectedDistrict: string | null`
- `randomSpot: Spot | null`
- `nearbySpot: Spot | null`

### Data

- Categories (static list)
- Districts (static list)
- Random spot (Supabase)
- Nearby spot (Supabase + Expo Location)

### User Actions

- Tap category → set selectedCategory
- Tap district → set selectedDistrict
- Tap “CERCAR”:
  - Only category → navigate to CategoryList
  - Only district → navigate to DistrictList
  - Category + district → navigate to CategoryDistrictList
- Tap random spot → SpotDetail
- Tap nearby spot → SpotDetail
- Tap header button:
  - If logged out → Login
  - If logged in → AddSpot

---

## CategoryList Screen (`app/category/[category].tsx`)

### Purpose

Display all spots belonging to a specific category.

### Components

- Header
- SpotCard (vertical list)

### Data

- `category` (route param)
- Spots filtered by category

### User Actions

- Tap spot → SpotDetail

---

## DistrictList Screen (`app/district/[district].tsx`)

### Purpose

Display all spots belonging to a specific district.

### Components

- Header
- SpotCard (vertical list)

### Data

- `district` (route param)
- Spots filtered by district

### User Actions

- Tap spot → SpotDetail

---

## CategoryDistrictList Screen (`app/search/[category]/[district].tsx`)

### Purpose

Display spots filtered by both category and district.

### Components

- Header
- SpotCard (vertical list)

### Data

- `category` (route param)
- `district` (route param)
- Spots filtered by both fields

### User Actions

- Tap spot → SpotDetail

---

## SpotDetail Screen (`app/spot/[id].tsx`)

### Purpose

Display full details of a spot.

### Components

- ImageHeader
- SpotInfo (name, description, website)
- CategoryTag
- DistrictButton
- MapViewWrapper
- FavoriteButton

### Data

- `id` (route param)
- Spot data (Supabase)
- Favorite status (Supabase)

### User Actions

- Tap district → DistrictList
- Add/remove favorite
- Open external website link

---

## Login Screen (`app/login.tsx`)

### Purpose

Allow users to authenticate using Google or email/password.

### Components

- GoogleLoginButton
- EmailLoginForm
- ToggleLoginRegister

### User Actions

- Login with Google
- Login with email/password
- Register new user
- Navigate to AddSpot after login (if triggered from Home)

---

## AddSpot Screen (`app/add-spot.tsx`)

### Purpose

Allow authenticated users to create new spots.

### Components

- SpotForm
- ImageUpload
- CategoryDropdown
- DistrictDropdown
- LocationButton
- PublishButton

### Data

- name
- description
- website (optional)
- image_url
- category
- district
- latitude
- longitude

### User Actions

- Upload image
- Get current location
- Submit form → insert into Supabase

---

## Favorites Screen (`app/favorites.tsx`)

### Purpose

Display all spots saved as favorites by the user.

### Components

- Header
- SpotCard (vertical list)

### Data

- favorites[] (Supabase)

### User Actions

- Tap spot → SpotDetail
- Remove favorite

---

## Profile Screen (`app/profile.tsx`)

### Purpose

Display user profile information.

### Components

- Avatar
- Email
- LogoutButton

### User Actions

- Logout

---

## SignUp Screen (`app/signup.tsx`)

### Purpose

Allow users to create a new account using email and password.

### Components

- SignUpForm
- ToggleLoginRegister (optional)

### Data

- email
- password
- confirmPassword

### User Actions

- Submit form → validate fields
- Create Supabase user via `auth.signUp`
- Insert profile row into `profiles`
- Navigate to Home (`/`)
- Tap “Already have an account?” → navigate to Login

---
