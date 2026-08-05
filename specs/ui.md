# UI Specification (SDD) — GetOutBCN

### Versión integrada con Stitch, adaptada a React Native + Expo

---

## 1. Design Principles

### 1.1 Simplicity

The UI must remain minimal, clean, and easy to navigate.  
No visual clutter. No unnecessary decoration.

### 1.2 High Contrast

Spot images and category/district rows must stand out clearly.  
Text must always maintain strong contrast against backgrounds.

### 1.3 Motion as Identity

The app’s identity is defined by:

- Opposite-direction auto-scrolling rows
- Smooth transitions between screens
- Subtle micro-interactions

### 1.4 Consistency

All components follow shared spacing, typography, and color rules.

---

## 2. Color System (Dark Mode — Brutalismo Industrial)

### 2.1 Backgrounds

- `background`: `#131313`
- `surface`: `#101508`
- `surface-low`: `#1C1B1B`
- `surface-high`: `#2A2A2A`
- `surface-highest`: `#353534`

### 2.2 Accent (Verde Tóxico)

- `primary`: `#A9F900`
- `primary-dim`: `#94DB00`
- `on-primary`: `#121F00`

### 2.3 Text

- `text-primary`: `#FFFFFF`
- `text-secondary`: `#C1CAAD`
- `text-muted`: `#8B947A`

### 2.4 Status

- `error`: `#FF4D4D`
- `warning`: `#FFCC00`

---

## 3. Typography (Inter)

### 3.1 Titles

- **Title XL:** 48px, 900, uppercase
- **Title LG:** 32px, 800, uppercase
- **Title LG Mobile:** 24px, 800, uppercase

### 3.2 Body

- **Body Main:** 16px, 400
- **Body Highlight:** 18px, 500

### 3.3 Labels

- **Industrial Label:** 12px, 700, uppercase, letter-spacing 0.1em

---

## 4. Layout Rules

### 4.1 Global Padding

- Horizontal padding: **16px**
- Vertical padding: **12px**

### 4.2 Card Layout

All cards (SpotCard, RandomSpotCard, NearbySpotCard):

- Rounded corners: **12px**
- Shadow: subtle elevation
- Image height: **160–200px**
- Text padding inside card: **12px**

### 4.3 Header Layout

- Height: **56px**
- Left: app logo
- Right: login/add-spot button
- Background: transparent or solid depending on screen

### 4.4 Form Layout (AddSpot & SignUp)

- Vertical spacing between fields: **16px**
- Input height: **48px**
- Submit button height: **52px**
- Error text color (SignUp): `#D32F2F`
- SignUp layout centered vertically
- “Already have an account?” link below form with muted text color `#616161`

---

## 5. Component Styling

### 5.1 CategoryRow & DistrictRow

- Height: **64px**
- Item spacing: **12px**
- Item padding: **12px 16px**
- Item background: `#2A2A2A`
- Selected item background: `#A9F900`
- Selected item text color: `#121F00`
- Border radius: **20px**
- Auto-scrolling:
  - CategoryRow scrolls left
  - DistrictRow scrolls right

### 5.2 SearchButton

- Height: **52px**
- Background: `#A9F900`
- Text: `#121F00`, bold
- Border radius: **12px**
- Shadow: medium elevation

### 5.3 SpotCard

- Rounded corners: **12px**
- Shadow: subtle
- Image: full width, fixed height
- Title: bold
- Category/district tags: small pill-shaped badges

### 5.4 FavoriteButton

- Icon size: **28px**
- Filled heart: `#A9F900`
- Outline heart: `#8B947A`

### 5.5 MapViewWrapper

- Height: **200px**
- Rounded corners: **12px**
- Overflow: hidden

### 5.6 SignUpForm

- Inputs stacked vertically
- Email input uses standard text field styling
- Password and Confirm Password inputs use secure text entry
- Error messages appear directly below each field
- Submit button uses toxic green (`#A9F900`)
- Secondary link uses muted text (`#616161`)

---

## 6. Animations & Motion (React Native / Reanimated)

### 6.1 Auto-Scrolling Rows

- CategoryRow scrolls left
- DistrictRow scrolls right
- Speed: slow, continuous
- Loop: infinite
- Easing: linear

### 6.2 Screen Transitions

- Fade-in content on screen load
- Slide-from-right for navigation transitions

### 6.3 Micro-Interactions

- Button press: scale to **0.97** then back
- Favorite toggle: quick scale pop

### 6.4 SignUp Screen Transitions

- Fade-in on screen load
- Slight upward motion (10–12px) for the form container
- Button press animation identical to Login screen (scale to **0.97**)

---

## 7. Interaction Rules

### 7.1 Touch Targets

Minimum touch area: **44px × 44px**

### 7.2 Feedback

- Buttons must provide visual feedback on press
- Disabled SearchButton must appear dimmed

### 7.3 Error Handling

- Form errors displayed below fields in red
- Toast notifications for critical errors

---

## 8. Accessibility

### 8.1 Contrast

All text must meet WCAG AA contrast ratios.

### 8.2 Font Scaling

All text must support dynamic type scaling.

### 8.3 Touch Areas

All interactive elements must meet minimum touch size.

---

## 9. Branding

### 9.1 Logo

- Placed in Header (left side)
- Must not be stretched or distorted

### 9.2 Visual Identity

- Motion + toxic green accent define the brand
- Clean, modern, minimal UI

---

## 10. Future UI Extensions

### 10.1 Admin UI

- EditSpot screen will reuse SpotForm
- Admin-only badges may be added later

### 10.2 Virtual Spots

- “No district” badge styling:
  - Background: `#E0E0E0`
  - Text: `#616161`
