# Design System

## Visual direction
The interface is intentionally calm, warm, and operational.

The design goal is not “generic admin panel.” It is a retreat control room that feels:

- trustworthy
- church-appropriate
- readable under pressure
- easy to scan in a busy hall or on a phone

## Layout principles
- Left sidebar for global navigation on desktop.
- Top bar for retreat identity, view mode switching, and utility controls.
- Sectioned dashboard cards for information density.
- Rounded corners and soft shadows for a friendly, non-clinical feel.
- Mobile mode collapses sidebar navigation and converts complex tables into cards.

## Typography
The app uses a Korean-friendly sans stack:

- `Pretendard`
- `SUIT`
- `Apple SD Gothic Neo`
- `Arial`

Typography is used to express hierarchy rather than decoration.

Recommended hierarchy:
- page titles: bold and large
- section headings: medium-to-bold
- labels: small and semibold
- metadata: muted and compact

## Component language
The app is built from recurring UI primitives:

- cards
- pills/badges
- segmented controls
- drawers
- modal dialogs
- icon labels
- status bars
- compact summary rows

This consistency matters because the product has a lot of operational surface area.

## Visual tone
The palette stays mostly in greens, sage, cream, soft gray, and restrained accent colors.
This keeps the retreat brand feeling cohesive while letting status colors carry meaning.

## Reusable patterns
### Buttons
- Primary buttons use the forest green brand color.
- Secondary buttons stay white with soft borders.
- Danger actions use a red family.

### Cards
- White or near-white surfaces with subtle borders.
- Shadows are light and unobtrusive.
- Hover states are gentle rather than flashy.

### Status chips
- Used for family status, attendance state, and document room filters.
- A status should be immediately scannable without reading the label first.

### Drawers
- Used for detailed member views, meal popups, and Google Drive actions.
- Mobile drawers are especially important because they preserve context without navigating away.

## Design constraints already embedded in the codebase
- The app must work cleanly on both desktop and mobile.
- The dashboard should remain readable even with high-density retreat data.
- Color should carry meaning, but never be the only meaning.
- Icons should reinforce labels, not replace them.

## Recommended future design rule
When adding new UI, match the existing tone:

- avoid glossy or neon accents
- avoid generic enterprise blue dashboards
- prefer warm neutrals with one strong forest accent
- use semantic colors consistently across tables, badges, and charts

