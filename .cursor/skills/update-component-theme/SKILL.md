---
name: update-component-theme
description: >-
  Restyles React/Next.js components to use CholoBD data-theme CSS variables and
  theme utility classes from src/app/globals.css. Use when the user asks to
  update component styles for themes, apply theme classes, restyle a file to
  match globals.css themes, replace hardcoded colors (gray/green/Tailwind
  palette) with theme-* classes, or make a component theme-aware.
---

# Update Component Theme

Restyle a given component/file so its colors follow the active `data-theme` on `<html>`, using tokens and utility classes defined in `src/app/globals.css`.

## Source of truth

Always read `src/app/globals.css` before editing. Do not invent new theme class names or CSS variables.

Themes switch via:

```js
document.documentElement.setAttribute('data-theme', 'ocean');
```

Named themes in globals (verify current list in the file): `forest` (default), `dusk`, `crimson`, `violet`, `amber`, `rose`, `ice-blue`.

## Workflow

Copy and track:

```
Theme restyle:
- [ ] 1. Read globals.css theme vars + utility classes
- [ ] 2. Open target component; list hardcoded color classes / hex / rgb
- [ ] 3. Map each color role → theme utility or var(--theme-*)
- [ ] 4. Apply replacements; keep layout/spacing/behavior unchanged
- [ ] 5. Prefer theme-* classes over inline style; use style only when no class fits
- [ ] 6. Spot-check: no leftover bg-gray-*, text-green-*, border-green-*, etc. for brand colors
```

## Color role → class map

| Role | Prefer | CSS var (inline fallback) |
|------|--------|---------------------------|
| Page / dominant bg | (body uses `--background`) | `var(--theme-bg)` |
| Section panel | `theme-section` | `var(--theme-section-bg)` |
| Card / nested panel | `theme-card` | `var(--theme-card-bg)` |
| Primary button / CTA | `theme-btn-teal` | `var(--theme-teal)` + hover `var(--theme-teal-hover)` |
| Legacy green button | `green-button` | same teal vars |
| Body text | `theme-text` | `var(--theme-text)` |
| Secondary text | `theme-text-muted` | `var(--theme-text-muted)` |
| Hint / placeholder text | `theme-text-subtle` | `var(--theme-text-subtle)` |
| Accent / link text | `theme-text-teal` | `var(--theme-teal)` |
| Form label / title | `theme-label` | teal + weight |
| Chip / tag / amenity | `theme-badge` | card bg + teal border |
| Outline | `theme-outline` or `theme-outline-teal` | deep / teal |
| Input | `theme-input` | `var(--theme-input-bg)` |
| Star rating | `theme-star` | `var(--theme-star)` |
| Nav / footer / sidebar header | `theme-nav`, `theme-footer`, `theme-sidebar-header` | teal family |
| Avatar / placeholder fill | `theme-avatar`, `theme-placeholder` | teal |
| Destructive / remove affordance | keep a clear red; if a theme red exists use it | do not map remove buttons to teal |

Legacy aliases (also theme-driven): `bg-section`, `bg-sub-section`, `bg-title`, `bg-header`, `bg-sub-header`.

## Replacement rules

1. **Hardcoded Tailwind brand colors → theme classes**
   - `bg-green-*` / `hover:bg-green-*` on buttons → `theme-btn-teal` (drop separate hover color class if the utility already defines hover)
   - `bg-gray-*` panels → `theme-section` or `theme-card` by nesting depth
   - `border-green-*` → `theme-outline` or `theme-outline-teal`
   - `text-green-*` / generic dark text for copy → `theme-text`, `theme-text-muted`, `theme-text-teal`, or `theme-label`
   - Selected chips/tags → `theme-badge` (or `theme-btn-teal` if solid primary chips fit better)

2. **Preserve non-color styling**
   - Keep flex/grid, spacing, sizing, rounded, typography scale, and behavior props unchanged unless they block theme application.

3. **Child components with color props**
   - If a shared button accepts `buttonColor` / `buttonHoverColor`, pass theme classes (e.g. `buttonColor="theme-btn-teal"` and clear redundant hover props when hover is built into the theme class).

4. **Inline styles**
   - Use only when no utility covers the need:
     `style={{ backgroundColor: 'var(--theme-section-bg)', color: 'var(--theme-text)' }}`
   - Never hardcode hex that duplicates a theme token.

5. **Do not**
   - Add new `[data-theme]` blocks or redefine `:root` vars unless the user asks to create/edit a theme
   - Change component logic, API calls, or props for a pure style pass
   - Use purple/indigo “AI default” palettes or one-off colors outside the theme system

## Example (before → after)

```tsx
// Before
<div className="bg-gray-400 border-green-700 border-2">
  <span className="bg-gray-700 text-white">Tag</span>
  <button className="bg-green-500 hover:bg-green-400 text-white">Add</button>
</div>

// After
<div className="theme-section theme-outline-teal border-2">
  <span className="theme-badge">Tag</span>
  <button className="theme-btn-teal text-white">Add</button>
</div>
```

## Done criteria

- Component colors come from `theme-*` classes or `var(--theme-*)` only
- Layout and behavior unchanged
- Looks correct under any `data-theme` from globals.css without per-theme conditionals in the component
