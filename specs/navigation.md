# Navigation Specification (SDD)

This document defines the navigation structure and routing logic for the GetOutBCN mobile application.  
The project uses Expo Router, which maps screens directly to filesystem routes.

---

# 1. Routing Structure (Expo Router)

## 1.1 Root Directory

/app
index.tsx → Home Screen
login.tsx → Login Screen
/signup.tsx → SignUp Screen
add-spot.tsx → AddSpot Screen
favorites.tsx → Favorites Screen
profile.tsx → Profile Screen

/category
[category].tsx → CategoryList Screen

/district
[district].tsx → DistrictList Screen

/search
[category]
[district].tsx → CategoryDistrictList Screen

/spot
[id].tsx → SpotDetail Screen

---

# 2. Navigation Rules

## 2.1 Home → CategoryList

**Trigger:** User selects a category and taps “CERCAR”  
**Route:**  
`/category/[category]`

---

## 2.2 Home → DistrictList

**Trigger:** User selects a district and taps “CERCAR”  
**Route:**  
`/district/[district]`

---

## 2.3 Home → CategoryDistrictList

**Trigger:** User selects both category + district and taps “CERCAR”  
**Route:**  
`/search/[category]/[district]`

---

## 2.4 Home → SpotDetail

**Trigger:** User taps RandomSpotCard or NearbySpotCard  
**Route:**  
`/spot/[id]`

---

## 2.5 Home → Login

**Trigger:** User taps header button while unauthenticated  
**Route:**  
`/login`

---

## 2.6 Home → AddSpot

**Trigger:** User taps header button while authenticated  
**Route:**  
`/add-spot`

---

# 3. CategoryList Navigation

## 3.1 CategoryList → SpotDetail

**Trigger:** User taps a SpotCard  
**Route:**  
`/spot/[id]`

---

# 4. DistrictList Navigation

## 4.1 DistrictList → SpotDetail

**Trigger:** User taps a SpotCard  
**Route:**  
`/spot/[id]`

---

# 5. CategoryDistrictList Navigation

## 5.1 CategoryDistrictList → SpotDetail

**Trigger:** User taps a SpotCard  
**Route:**  
`/spot/[id]`

---

# 6. SpotDetail Navigation

## 6.1 SpotDetail → DistrictList

**Trigger:** User taps DistrictButton  
**Route:**  
`/district/[district]`

---

## 6.2 SpotDetail → (Admin) EditSpot

**Trigger:** Admin taps “Edit Spot”  
**Route:**  
`/spot/[id]/edit` _(future screen)_

---

# 7. Login Navigation

## 7.1 Login → AddSpot

**Trigger:** Login initiated from Home header  
**Route:**  
`/add-spot`

---

## 7.2 Login → Home

**Trigger:** Login initiated from other screens  
**Route:**  
`/`

---

## 7.3 Login → SignUp

**Trigger:** User taps “Crear cuenta”  
**Route:**  
`/signup`

---

# 8. AddSpot Navigation

## 8.1 AddSpot → SpotDetail

**Trigger:** User publishes a new spot  
**Route:**  
`/spot/[id]`

---

# 9. Favorites Navigation

## 9.1 Favorites → SpotDetail

**Trigger:** User taps a SpotCard  
**Route:**  
`/spot/[id]`

---

# 10. Profile Navigation

## 10.1 Profile → Home

**Trigger:** User logs out  
**Route:**  
`/`

---

# 11. Navigation Constraints

### Authentication Required

- `/add-spot`
- `/favorites`
- `/profile`

If user is not authenticated:

- Redirect to `/login`

### Admin Privileges

Admins can access:

- `/spot/[id]/edit`
- Future admin dashboards

---

### Public Routes

- `/login`
- `/signup`

---

# 12. Deep Linking (Optional Future Feature)

Examples:

- `getoutbcn://spot/123`
- `getoutbcn://category/Food`
- `getoutbcn://district/Gràcia`

---

# 13. SignUp Navigation

## 13.1 SignUp → Home

**Trigger:** User completes registration successfully  
**Route:**  
`/`

---
