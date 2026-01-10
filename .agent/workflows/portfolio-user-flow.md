---
description: Portfolio Neo-Brutalism User Flow
---

# Portfolio Website Neo-Brutalism - User Flow & Navigation

## Layout Structure

Website menggunakan **split-panel layout**:

```
┌────────────────┬──────────────────────────────────────┐
│                │                                      │
│  LEFT PANEL    │        RIGHT PANEL                   │
│  (Fixed Nav)   │     (Scrollable Content)             │
│                │                                      │
│  - Logo        │  - Home (Hero)                       │
│  - Nav Menu    │  - About Me                          │
│  - Social      │  - Projects (UI/UX + WEB tabs)       │
│                │  - Skills                            │
│                │  - Contact                           │
│                │                                      │
└────────────────┴──────────────────────────────────────┘
```

## User Flow

### Navigation:
1. **[01] Home** → Hero section dengan tagline dan CTA buttons
2. **[02] About** → About Me, Education, Quick Stats
3. **[03] Projects** → Tab switcher (UI/UX | WEB) + Project cards
4. **[04] Skills** → Grid of tools/skills
5. **[05] Contact** → Email CTA + Copy email button

### Project Interactions:
- **UI/UX Projects**: Click → Open modal dengan detail image
- **WEB Projects**: Click → Open external link di tab baru

### Interactive Elements:
- **Background**: Canvas-based particle system yang bereaksi terhadap cursor
- **Navigation**: Smooth scroll + active state indicator
- **Buttons**: Neo-Brutalism hover/active effects
- **Cards**: Shadow animation on hover

## Key Files

- `app/ClientHomePage.tsx` - Main component dengan semua sections
- `app/globals.css` - Neo-Brutalism styling system
- `app/components/InteractiveBackground/InteractiveBackground.tsx` - Particle canvas

## Styling Guide (Neo-Brutalism)

### Colors:
```css
--color-black: #0A0A0A;
--color-white: #FFFFFF;
--color-gray-*: grayscale palette
```

### Shadows:
```css
--shadow-sm: 2px 2px 0px #000;
--shadow-md: 4px 4px 0px #000;
--shadow-lg: 6px 6px 0px #000;
```

### Interactions:
- Hover: `transform: translate(-2px, -2px)` + larger shadow
- Active: `transform: translate(2px, 2px)` + smaller shadow
