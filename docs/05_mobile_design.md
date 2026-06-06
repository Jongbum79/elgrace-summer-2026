# Mobile Design

## Purpose
The mobile experience is a first-class mode, not a secondary afterthought.

The app switches to mobile mode through the global view-mode toggle or the saved viewport preference.

## High-level mobile behavior
When `body.mobile-mode` is active, the UI changes in several ways:

- the sidebar disappears
- the top bar compresses
- the bottom navigation appears
- dense tables become cards
- complex control rows become stacked controls
- chart and summary blocks collapse into a vertical flow

## Why this matters
Retreat operations are often handled while standing, walking, or coordinating with other staff.

The mobile layout is optimized for:

- quick glanceability
- large touch targets
- shorter vertical scan paths
- fewer horizontal scroll traps

## Key responsive patterns
### Dashboard
- stats become a 2-column grid
- cards become more compact
- supporting text is reduced

### Family table
- table rows become stacked cards
- the header disappears
- each row becomes a self-contained summary block
- action menus are moved into reachable positions

### Participant management
- org charts collapse to a single column
- mobile group cards show summary bars instead of the full desktop card grid
- group detail drawers are used for deeper inspection

### Church school
- the school filter becomes horizontal, segmented, and touch-friendly
- the student list becomes cards rather than a wide table

### Drawers and modals
- bottom drawers are rounded and easier to dismiss
- touch targets are kept large enough for thumb navigation

## Mobile rule of thumb
If a desktop view depends on scanning across columns, the mobile version should convert that information into:

- a card
- a summary row
- or a stack of labeled fields

## Implementation note
Mobile styling is handled mostly through CSS overrides on `body.mobile-mode`.
That keeps the same HTML and business logic while altering presentation only.

