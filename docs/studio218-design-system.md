# Studio 218 — Design System

> Source: [https://s218.preprod218.fr/](https://s218.preprod218.fr/)  
> Extracted: July 10, 2026  
> Stack: WordPress · Hello Elementor theme · Elementor Pro (Site Kit #7)

---

## Brand identity

Studio 218 is a Lyon-based digital marketing agency. The visual language is **modern, tech-forward, and confident**: a cyan/teal accent on clean white backgrounds, with dark cinematic hero imagery and bold sans-serif typography. The tagline *« Le beau performe »* reflects a balance of aesthetics and measurable results.

---

## Color palette

### Primary brand colors

| Token | Hex | Usage |
|-------|-----|-------|
| **Primary (Cyan)** | `#22AFCA` | Buttons, links, logo accent, CTAs, icons, borders |
| **Primary hover** | `#04CBF2` | Button hover/focus state |
| **Primary light** | `#04CBF1` | Alternate cyan tint (custom CSS var) |
| **Secondary (Blue tint)** | `#E8F7FA` | Light backgrounds, secondary surfaces |
| **Accent (Dark blue-grey)** | `#303F50` | Headings accents, dark UI elements |

### Neutrals

| Token | Hex | Usage |
|-------|-----|-------|
| **Text** | `#000000` | Body copy, headings |
| **White** | `#FFFFFF` | Page background, button text on filled buttons |
| **Grey** | `#838383` | Muted text |
| **Dark grey** | `#303F50` | Strong secondary text |
| **Light grey** | `#B0B0B0` | Disabled / subtle UI |

### Supporting / section backgrounds

| Token | Hex | Usage |
|-------|-----|-------|
| **Blue wash** | `#EAEFF9` | Soft tinted section backgrounds |
| **Pink wash** | `#FAEDEF` | Soft warm section backgrounds |
| **Page transition** | `#FFBC7D` | Elementor page transition overlay |

### CSS custom properties (site-level)

```css
:root {
  --white: #fff;
  --black: #000000;
  --blue: #22AFCA;
  --blue-light: #04CBF1;
  --blue-lighter: #E8F7FA;
  --grey: #838383;
  --dark-grey: #303F50;
  --shadow: 0 4px 7.9px rgba(0, 0, 0, 0.03);
}
```

### Elementor global colors (Kit 7)

```css
.elementor-kit-7 {
  --e-global-color-primary: #22AFCA;
  --e-global-color-secondary: #E8F7FA;
  --e-global-color-text: #000000;
  --e-global-color-accent: #303F50;
  --e-global-color-135b13e: #FFFFFF;
  --e-global-color-e3b7e08: #04CBF2;
  --e-global-color-1f18e49: #B0B0B0;
  --e-global-color-051cc8d: #EAEFF9;
  --e-global-color-6b1384f: #FAEDEF;
}
```

### Color usage notes

- **Hero sections** use dark photographic backgrounds with white/outlined text; cyan is reserved for primary actions.
- **Filled buttons**: cyan background (`#22AFCA`) + white text.
- **Outline buttons**: white border + transparent background + white text (on dark hero).
- **Ghost/outline CTA on hero**: `2px solid #FFFFFF`, pill-shaped corners (~50px radius).
- **Google rating stars**: gold/yellow (`#FBBC04` approximate).

---

## Typography

### Font families

| Role | Family | Source |
|------|--------|--------|
| **Primary** | [Poppins](https://fonts.google.com/specimen/Poppins) | Google Fonts — weights 100–900 |
| **Secondary** | [Inter](https://fonts.google.com/specimen/Inter) | Google Fonts — footer / small headings |
| **Display / decorative** | [Urbanist](https://fonts.google.com/specimen/Urbanist) | Inline styles — hero vertical outlined text |

```html
<link href="https://fonts.googleapis.com/css?family=Poppins:100,100italic,200,200italic,300,300italic,400,400italic,500,500italic,600,600italic,700,700italic,800,800italic,900,900italic&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css?family=Inter:100,100italic,200,200italic,300,300italic,400,400italic,500,500italic,600,600italic,700,700italic,800,800italic,900,900italic&display=swap" rel="stylesheet">
```

### Type scale (desktop)

| Style | Font | Size | Weight | Line height | Color |
|-------|------|------|--------|-------------|-------|
| **H1 / Primary** | Poppins | 48px | 700 | 56px | `#000000` |
| **H2 / Secondary** | Poppins | 36px | 700 | 44px | `#000000` |
| **H3 / Accent** | Poppins | 30px | 700 | 35px | `#000000` |
| **H4** | Poppins | 24px | 600 | 28px | `#000000` |
| **Body** | Poppins | 14px | 400 | 20px | `#000000` |
| **Body small** | Poppins | 15px | 400 | 18px | `#000000` |
| **Button label** | Poppins | 15px | 600 | 18px | `#FFFFFF` |
| **Footer nav** | Inter | 15px | 400–600 | 18px | varies |

### Hero display text

Large hero headings use a **mixed treatment**:

- Solid white bold text for key words (*« Marketing digital & IA »*)
- **Outlined / stroke text** (white outline, transparent fill) for emphasis words
- Vertical sidebar labels (*ACCELERER · PERFORMER · FORMER*) in **Urbanist**, uppercase

### Responsive type scale

| Breakpoint | H1 | H2 | H3 | H4 |
|------------|----|----|----|----|
| **≤ 1366px** | 48px / 56px | 32px / 44px | 30px / 35px | 20px / 28px |
| **≤ 1024px** | 32px / 56px | 32px / 44px | 26px / 35px | 22px / 28px |
| **≤ 767px** | 35px / 56px | 28px / 30px | 24px / 24px | 20px / 28px |

---

## Layout & spacing

### Container widths

| Breakpoint | Max width |
|------------|-----------|
| Desktop | `1200px` |
| Tablet (≤ 1024px) | `1024px` |
| Mobile (≤ 767px) | `767px` (fluid) |

```css
.elementor-section.elementor-section-boxed > .elementor-container {
  max-width: 1200px;
}
.e-con {
  --container-max-width: 1200px;
}
```

### Spacing

- Default widget spacing: `0px` (tight Elementor layout)
- Button padding: `8px 14px`
- Hero min-height: `calc(100vh - 75px)` (full viewport minus header)
- Paragraph margin-bottom: `0px` (controlled per block)

### Grid / flex

- Built with **Elementor Flexbox containers** (`--display: flex`)
- Common column layouts: 2-column hero, 3-column service cards, logo carousel

---

## Components

### Buttons

**Primary (filled)**

```css
background-color: #22AFCA;
color: #FFFFFF;
font-family: Poppins, sans-serif;
font-size: 15px;
font-weight: 600;
line-height: 18px;
border: 2px solid #22AFCA;
border-radius: 12px;
padding: 8px 14px;
transition: all 0.35s ease;
```

**Primary hover**

```css
background-color: #04CBF2;
border-color: #04CBF2;
border-radius: 2px; /* sharpens on hover */
color: #FFFFFF;
```

**Outline / ghost (hero)**

```css
background: transparent;
color: #FFFFFF;
border: 2px solid #FFFFFF;
border-radius: 50px; /* pill shape */
padding: 8px 14px;
font-weight: 600–700;
```

Buttons include a **right-arrow icon** (→) after the label.

### Floating action button (phone)

- Shape: circle
- Background: `#22AFCA`
- Icon: white phone handset
- Position: fixed, bottom-right

### Cards & sections

| Element | Border radius | Shadow |
|---------|---------------|--------|
| Default card | `12px` | `0 4px 7.9px rgba(0,0,0,0.03)` |
| Rounded container | `20px` | — |
| Pill / tag | `30px`–`50px` | — |
| Hero container top | large rounded top corners | — |

### Navigation

- **Header**: white background, logo left, hamburger menu right (cyan icon)
- **Mega menu**: multi-column dropdowns with icon boxes per service
- **Sticky header** supported via Elementor Pro sticky module
- Phone number visible in header: `04 78 01 36 00`

### Forms

- Contact form with multi-select needs, budget dropdown, standard fields
- Submit button follows primary button style
- Labels in Poppins, inputs with standard Elementor form styling

### Carousels & sliders

- Powered by **Swiper v8**
- Swiper theme color: `#007aff` (library default; overridden by brand cyan in UI)

### Accordions (FAQ)

- Nested accordion widget
- Black text on white background
- Expand/collapse with chevron indicators

### Social proof

- Google 5.0 rating badge with star icons
- Client logo marquee (grayscale partner logos)
- Testimonial carousel with quote blocks

---

## Imagery

- **Hero**: high-contrast photography (laptop, light trails, orange/red/blue bokeh)
- **Project cards**: screenshot thumbnails with hover overlay
- **Sector cards**: photographic backgrounds with text overlay
- **Team / about**: lifestyle office photography
- Logo treatment: script *« 218 »* in cyan + *« STUDIO »* in black sans-serif inside a thin black frame

---

## Effects & motion

| Property | Value |
|----------|-------|
| Default transition | `0.35s ease` (all properties) |
| Box shadow | `0 4px 7.9px rgba(0, 0, 0, 0.03)` |
| Fade-in animations | Elementor `fadeIn` on scroll |
| Page transition overlay | `#FFBC7D` |

---

## Breakpoints

| Name | Max width | Notes |
|------|-----------|-------|
| Desktop XL | > 1366px | Full type scale |
| Desktop | ≤ 1366px | Slight H2/H4 reduction |
| Tablet | ≤ 1024px | Container narrows to 1024px |
| Mobile | ≤ 767px | Stacked layouts, reduced headings |

---

## Iconography

- **Elementor Icons** (`eicons` font family) for UI icons
- **Social icons**: Facebook, Instagram, LinkedIn (brand colors on hover)
- **Arrow icons**: inline SVG or icon font for CTAs
- **Service icons**: custom icon boxes in mega menu (48×48 approx.)

---

## Accessibility

- Skip link: *« Aller au contenu »*
- Semantic headings (H1–H3 hierarchy)
- `lang="fr-FR"` on document
- Focus states on buttons (border/color change on `:focus`)

---

## Quick reference — CSS variables

Copy-paste starter for implementations outside WordPress:

```css
:root {
  /* Brand */
  --s218-primary: #22AFCA;
  --s218-primary-hover: #04CBF2;
  --s218-secondary: #E8F7FA;
  --s218-accent: #303F50;

  /* Neutrals */
  --s218-text: #000000;
  --s218-white: #FFFFFF;
  --s218-grey: #838383;
  --s218-grey-light: #B0B0B0;

  /* Surfaces */
  --s218-bg-blue: #EAEFF9;
  --s218-bg-pink: #FAEDEF;
  --s218-shadow: 0 4px 7.9px rgba(0, 0, 0, 0.03);

  /* Typography */
  --s218-font-primary: 'Poppins', sans-serif;
  --s218-font-secondary: 'Inter', sans-serif;
  --s218-font-display: 'Urbanist', sans-serif;

  /* Layout */
  --s218-container-max: 1200px;
  --s218-radius-sm: 2px;
  --s218-radius-md: 12px;
  --s218-radius-lg: 20px;
  --s218-radius-pill: 50px;

  /* Motion */
  --s218-transition: 0.35s ease;
}
```

---

## Files of reference (live site)

| Resource | URL |
|----------|-----|
| Global Site Kit | `/wp-content/uploads/elementor/css/post-7.css` |
| Homepage styles | `/wp-content/uploads/elementor/css/post-2.css` |
| Footer styles | `/wp-content/uploads/elementor/css/post-546.css` |
| Theme base | `/wp-content/themes/hello-elementor/assets/css/theme.css` |
