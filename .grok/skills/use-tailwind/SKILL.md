---
name: use-tailwind
description: >
  Always style Superset UI with Tailwind CSS utility classes and the shared
  components in client/src/components/ui.jsx — never invent large custom CSS
  files or one-off class systems. Use when building pages, components, layout,
  forms, buttons, cards, checkout, catalog, or any frontend UI work in this
  project. Triggers: style, CSS, UI, component, page, design, layout, button,
  form, Tailwind, className. Slash: /use-tailwind
---

# Use Tailwind (Superset)

## Rule

**All frontend UI in this project uses Tailwind CSS.** Do not author bespoke CSS frameworks, large `index.css` component styles, or invented BEM-like class systems.

## Stack

- **Tailwind v4** via `@tailwindcss/vite` in `client/vite.config.js`
- Entry: `client/src/index.css` → `@import "tailwindcss"` (+ light `@theme` / `@layer base` only)
- Shared primitives: `client/src/components/ui.jsx`
- Class helper: `client/src/lib/cn.js`

## How to build UI

1. Prefer utilities in JSX: `className="flex gap-4 rounded-2xl border border-slate-800 …"`
2. Reuse or extend primitives from `ui.jsx` (`Button`, `Card`, `Input`, `Section`, `Container`, etc.)
3. Put **new repeated patterns** in `ui.jsx`, not a new CSS file
4. Keep `index.css` limited to Tailwind import, theme tokens, and minimal base resets
5. Stripe Elements may use Stripe’s `appearance` API (not CSS) for their iframes

## Do not

```css
/* BAD — inventing a private design system in CSS */
.btn.primary { … }
.product-card { … }
.hero-grid { … }
```

```jsx
// BAD
<div className="my-weird-card">…

// GOOD
import { Card, Button } from '../components/ui'
<Card className="p-6">…</Card>
```

## Palette conventions

- Background: `bg-slate-950` / `bg-slate-900`
- Borders: `border-slate-800`
- Text: `text-slate-50` / muted `text-slate-400`
- Accent: `teal-400` / `teal-500` / gradients `from-teal-400 to-cyan-400`
- Success / error: `emerald-*` / `rose-*`

## Checklist

- [ ] No new large custom CSS blocks for layout/components
- [ ] Tailwind utilities or `ui.jsx` primitives used
- [ ] Responsive with Tailwind breakpoints (`sm:`, `md:`, `lg:`)
- [ ] Dark scientific storefront look preserved
