# User Flow - Portfolio Website Neo-Brutalism

## Overview
Website portfolio dengan layout split-panel:
- **Left Panel (Fixed)**: Navigation menu - tidak scroll
- **Right Panel (Scrollable)**: Content area - bisa di-scroll
- **Interactive Background**: Particles/dots yang bereaksi terhadap cursor

---

## Page Structure

```
┌──────────────────────────────────────────────────────────────┐
│                    PORTFOLIO WEBSITE                          │
├─────────────────┬────────────────────────────────────────────┤
│                 │                                             │
│  LEFT PANEL     │           RIGHT PANEL                       │
│  (Fixed Nav)    │        (Scrollable Content)                 │
│                 │                                             │
│  ┌───────────┐  │  ┌────────────────────────────────────────┐ │
│  │   LOGO    │  │  │                                        │ │
│  │  GALUH    │  │  │    [CONTENT SECTION]                   │ │
│  └───────────┘  │  │                                        │ │
│                 │  │    - About Me                          │ │
│  [01] Home      │  │    - Projects (UI/UX & Web)            │ │
│  [02] About     │  │    - Skills                            │ │
│  [03] Projects  │  │    - Contact                           │ │
│  [04] Skills    │  │                                        │ │
│  [05] Contact   │  │                                        │ │
│                 │  └────────────────────────────────────────┘ │
│                 │                                             │
│  ┌───────────┐  │                                             │
│  │  SOCIAL   │  │                                             │
│  │  ICONS    │  │                                             │
│  └───────────┘  │                                             │
│                 │                                             │
└─────────────────┴────────────────────────────────────────────┘
```

---

## User Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         START                                    │
│                           │                                      │
│                           ▼                                      │
│                   ┌───────────────┐                              │
│                   │   LANDING     │ ◄── Interactive BG Active    │
│                   │   (Home)      │     Mouse particles react    │
│                   └───────┬───────┘                              │
│                           │                                      │
│    ┌──────────────────────┼──────────────────────┐               │
│    │                      │                      │               │
│    ▼                      ▼                      ▼               │
│ ┌──────┐            ┌──────────┐            ┌──────────┐         │
│ │ABOUT │            │ PROJECTS │            │ CONTACT  │         │
│ └──┬───┘            └────┬─────┘            └────┬─────┘         │
│    │                     │                       │               │
│    │                ┌────┴────┐                  │               │
│    │                │         │                  │               │
│    │                ▼         ▼                  │               │
│    │           ┌──────┐  ┌──────┐                │               │
│    │           │UI/UX │  │ WEB  │                │               │
│    │           └──┬───┘  └──┬───┘                │               │
│    │              │         │                    │               │
│    │              ▼         ▼                    │               │
│    │         ┌────────────────┐                  │               │
│    │         │ Project Modal  │                  │               │
│    │         │ (Detail View)  │                  │               │
│    │         │ or External    │                  │               │
│    │         │ Link (WEB)     │                  │               │
│    │         └────────────────┘                  │               │
│    │                                             │               │
│    └─────────────────────────────────────────────┘               │
│                                                                  │
│              SKILLS section accessible anytime                   │
│              via left navigation panel                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Navigation Flow

### Click Flow:
1. **[01] Home** → Scroll right panel ke atas (hero section)
2. **[02] About** → Scroll ke section About Me + Resume button
3. **[03] Projects** → Scroll ke Projects section (Tab: UI/UX | WEB)
4. **[04] Skills** → Scroll ke Skills section (Tools + GitHub Stats)
5. **[05] Contact** → Scroll ke Contact section (Email + CTA)

### Project Interaction:
- **UI/UX Projects** → Click = Open Modal dengan detail image
- **WEB Projects** → Click = Open external link di tab baru

---

## Interactive Elements

### Left Panel (Fixed):
- Logo/Name dengan hover effect (underline animation)
- Navigation items dengan numbered prefix [01-05]
- Active state indicator (bold + line)
- Social icons di bottom (GitHub, LinkedIn, etc.)

### Right Panel (Scrollable):
- Smooth scroll between sections
- Content sections dengan spacing yang jelas
- Project cards dengan Neo-Brutalism shadows
- Tab switcher untuk Projects (UI/UX | WEB)

### Background:
- Canvas-based particles/dots
- Particles move away from cursor (repel effect)
- Subtle animation - tidak mengganggu content
- Monochrome (black/white/gray dots)

---

## Neo-Brutalism Style Guide

### Colors:
- **Primary**: #FFFFFF (White)
- **Secondary**: #0A0A0A (Near Black)
- **Accent**: #1A1A1A (Dark Gray)
- **Border**: #000000 (Pure Black)

### Typography:
- **Headings**: Bold, uppercase, large size
- **Body**: Clean, readable, high contrast
- **Numbers**: Monospace for navigation prefix

### Shadows & Borders:
- **Border**: 2-4px solid black
- **Shadow**: 4-8px offset, solid black (no blur)
- **Hover**: Shadow offset increases

### Buttons:
```css
.neo-button {
  background: #FFFFFF;
  color: #000000;
  border: 3px solid #000000;
  box-shadow: 4px 4px 0px #000000;
  transition: all 0.2s ease;
}
.neo-button:hover {
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0px #000000;
}
.neo-button:active {
  transform: translate(2px, 2px);
  box-shadow: 2px 2px 0px #000000;
}
```

---

## Technical Implementation

### Components to Create/Modify:
1. `SplitLayout.tsx` - Main layout wrapper
2. `LeftNavigation.tsx` - Fixed left navigation panel
3. `RightContent.tsx` - Scrollable content wrapper
4. `InteractiveBackground.tsx` - Canvas particle system
5. `NeoProjectCard.tsx` - Project cards with brutalism style

### State Management:
- Active section tracking (for nav highlighting)
- Scroll position sync with navigation
- Mouse position for interactive background

---

## Responsive Design

### Desktop (>1024px):
- Full split-panel layout
- Left: 280px fixed
- Right: remaining width

### Tablet (768-1024px):
- Left panel collapses to icon-only
- Right panel expands

### Mobile (<768px):
- Bottom fixed navigation bar
- Full-width content
- Hamburger menu optional
