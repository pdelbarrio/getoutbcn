# Components Specification (SDD)

This document defines all reusable UI components in the GetOutBCN mobile application.

---

## Header

### Purpose

Top navigation bar displayed across multiple screens.

### Responsibilities

- Show app logo
- Show contextual action button:
  - Login (if user is not authenticated)
  - Add Spot (if user is authenticated)

### Props

- `user: User | null`

### Interactions

- Tap login → navigate to Login
- Tap add spot → navigate to AddSpot

---

## CategoryRow

### Purpose

Display all categories in a horizontally auto-scrolling row.

### Responsibilities

- Auto-scroll left continuously
- Highlight selected category
- Allow user to tap a category

### Props

- `categories: string[]`
- `selectedCategory: string | null`
- `onSelect(category: string): void`

### Interactions

- Tap category → set selectedCategory

---

## DistrictRow

### Purpose

Display all districts in a horizontally auto-scrolling row.

### Responsibilities

- Auto-scroll right continuously
- Highlight selected district
- Allow user to tap a district

### Props

- `districts: string[]`
- `selectedDistrict: string | null`
- `onSelect(district: string): void`

### Interactions

- Tap district → set selectedDistrict

---

## SearchButton

### Purpose

Trigger search based on selected category and/or district.

### Responsibilities

- Display “CERCAR”
- Validate selection state

### Props

- `selectedCategory: string | null`
- `selectedDistrict: string | null`
- `onSearch(): void`

### Interactions

- Tap → navigate to:
  - CategoryList
  - DistrictList
  - CategoryDistrictList

---

## RandomSpotCard

### Purpose

Display a random spot from Supabase.

### Responsibilities

- Show image + name
- Navigate to SpotDetail

### Props

- `spot: Spot`

### Interactions

- Tap → SpotDetail

---

## NearbySpotCard

### Purpose

Display a nearby random spot based on user location.

### Responsibilities

- Show image + name
- Navigate to SpotDetail

### Props

- `spot: Spot`

### Interactions

- Tap → SpotDetail

---

## SpotCard

### Purpose

Reusable card for listing spots.

### Responsibilities

- Show image
- Show name
- Show category/district (optional)

### Props

- `spot: Spot`

### Interactions

- Tap → SpotDetail

---

## ImageHeader

### Purpose

Display the main image at the top of SpotDetail.

### Responsibilities

- Full-width image
- Optional overlay

### Props

- `imageUrl: string`

---

## SpotInfo

### Purpose

Display textual information about a spot.

### Responsibilities

- Show name
- Show description
- Show website link (if present)

### Props

- `name: string`
- `description: string`
- `website?: string`

### Interactions

- Tap website → open external browser

---

## CategoryTag

### Purpose

Display the category of a spot.

### Responsibilities

- Styled tag component

### Props

- `category: string`

---

## DistrictButton

### Purpose

Navigate to DistrictList from SpotDetail.

### Responsibilities

- Show district name
- Styled as a button

### Props

- `district: string`

### Interactions

- Tap → DistrictList

---

## MapViewWrapper

### Purpose

Display a map centered on the spot location.

### Responsibilities

- Show marker
- Show map region

### Props

- `latitude: number`
- `longitude: number`

---

## FavoriteButton

### Purpose

Allow users to add/remove a spot from favorites.

### Responsibilities

- Show filled/empty icon
- Toggle favorite state

### Props

- `spotId: string`
- `isFavorite: boolean`
- `onToggle(): void`

### Interactions

- Tap → add/remove favorite in Supabase

---

## GoogleLoginButton

### Purpose

Trigger Google authentication.

### Responsibilities

- Styled Google button
- Call Supabase OAuth

### Interactions

- Tap → Google login flow

---

## EmailLoginForm

### Purpose

Allow login via email/password.

### Responsibilities

- Email input
- Password input
- Submit button

### Props

- `onSubmit(email: string, password: string): void`

---

## ToggleLoginRegister

### Purpose

Switch between login and register modes.

### Responsibilities

- Display toggle text
- Update UI state

### Props

- `mode: "login" | "register"`
- `onToggle(): void`

---

## SpotForm

### Purpose

Form used in AddSpot screen.

### Responsibilities

- Input fields for spot data
- Validation

### Props

- `onSubmit(spotData: SpotInput): void`

### Fields

- name
- description
- website
- category
- district
- latitude
- longitude
- image_url

---

## ImageUpload

### Purpose

Allow users to upload an image for a spot.

### Responsibilities

- Open image picker
- Upload to Supabase Storage or external provider (Cloudinary)

### Props

- `onUpload(url: string): void`

---

## CategoryDropdown

### Purpose

Select a category from a list.

### Props

- `categories: string[]`
- `selected: string | null`
- `onSelect(category: string): void`

---

## DistrictDropdown

### Purpose

Select a district from a list.

### Props

- `districts: string[]`
- `selected: string | null`
- `onSelect(district: string): void`

---

## LocationButton

### Purpose

Fetch user’s current location.

### Responsibilities

- Request permission
- Get coordinates

### Props

- `onLocation(latitude: number, longitude: number): void`

---

## PublishButton

### Purpose

Submit a new spot.

### Props

- `onPress(): void`

---

## SignUpForm

### Purpose

Allow users to create an account using email and password.

## Responsibilities

Email input

Password input

Confirm password input

Validate fields

Display error messages

Submit registration request

### Props

- `onSubmit(email: string, password: string, confirmPassword: string): void`

### Interactions

Tap “Crear cuenta” → validate → call onSubmit

Tap “Volver al login” → navigate to Login
