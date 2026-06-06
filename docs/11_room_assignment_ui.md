# Room Assignment UI Specification

## Scope
This document defines the intended UI and interaction model for the Room Assignment page.

It is a design specification only. It does not introduce implementation code.

The page must be driven by the existing business rules in the project and the generated room layout assets in `assets/`. The Excel workbook remains the single source of truth for room structure.

## Design Goals
- Feel like an Apple-style and Linear-style premium SaaS control surface.
- Avoid ERP density and avoid Bootstrap admin chrome.
- Make room assignment readable at a glance, even in a busy retreat week.
- Keep the room map, family list, and assignment actions in one coherent workspace.
- Prioritize mobile usability without losing assignment precision.
- Preserve existing business logic, APIs, routing assumptions, and permission rules.

## Source Data Expectations
The page should consume generated room data rather than hardcoded room numbers.

Expected room data fields:
- building
- floor
- room number
- room type
- capacity
- corridor relationship
- source cell reference

Observed room categories in the workbook:
- 1인실
- 2인실
- 4인실 온돌
- 6인실
- 12인실

Observed structure characteristics:
- Multiple buildings
- Multiple floors
- Corridor-separated room clusters
- Service spaces such as elevator, stairs, laundry, and utility rooms

## Information Architecture
The Room Assignment page should present three synchronized layers:

1. Building and floor structure
2. Individual room occupancy
3. Family placement and assignment actions

The page should answer these questions immediately:

- Which rooms are available?
- Which rooms are full, partial, or empty?
- Which families still need assignment?
- Which families are likely to fit together?
- Which room constraints are currently violated?

## Desktop Layout

### Overall structure
Use a two-panel workspace with a persistent top header:

- Header: title, summary, filters, and primary actions
- Left panel: room map / building structure
- Right panel: family queue / assignment worklist
- Optional bottom or right-side inspector for detailed room or family state

### Header
The top header should include:
- page title: `방 배정`
- short subtitle explaining that room allocation is being finalized
- compact summary chips:
  - total rooms
  - assigned rooms
  - empty rooms
  - occupied beds or heads
  - unassigned families
- primary actions:
  - Auto Assign
  - Save Changes
  - Export Rooming List

### Left panel: room map
The room map should be the primary visual anchor on desktop.

Recommended layout:
- grouped by building
- grouped again by floor
- rooms displayed as cards or compact tiles
- service spaces visually separated and de-emphasized
- corridor line or corridor band used as a structural cue

Each floor should be visually scannable in one viewport without excessive horizontal scrolling.

### Right panel: family assignment queue
The family list should show:
- families with `미배정`
- families with partial room assignment needs
- families flagged by validation rules
- families with special constraints

This panel should support:
- search by family name, leader name, or room number
- filter by status
- filter by building or floor preference
- sort by size, priority, or assignment completeness

### Inspector behavior
Selecting a room or family opens an inspector panel.

If a room is selected:
- show room number
- show room type
- show capacity
- show current occupancy
- show assigned families
- show fit warnings
- show neighboring rooms on the same corridor

If a family is selected:
- show family name
- show leader
- show member count
- show attendance state
- show current room assignment
- show suggested rooms
- show assignment history if available

## Mobile Layout

### Overall structure
Mobile must preserve the same operations but reduce simultaneous surface area.

Recommended mobile order:
1. Summary strip
2. Filter bar
3. Assignment queue
4. Room map cards
5. Bottom sheet inspector

### Mobile navigation model
Use a segmented switch or tab-like control:
- `방 현황`
- `가족 대기열`
- `자동배정`

### Room browsing on mobile
Rooms should be shown as vertical cards or compact grouped cards.

Each room card should expose:
- room number
- room type badge
- capacity badge
- occupancy indicator
- assigned family names

The user should be able to expand a room card for more detail rather than relying on hover.

### Family queue on mobile
Families should appear as stacked cards with:
- family name
- leader
- attendee count
- current status
- room assignment state

Touch targets must be large enough for one-handed use.

### Bottom sheet inspector
On mobile, selecting a room or family should open a bottom sheet instead of a right-side drawer.

The sheet should have:
- a clear grab bar
- sticky title
- actions pinned near the bottom
- scrollable detail content

## Drag & Drop UX

### Interaction model
Room assignment should support drag and drop, but the interaction must remain conservative and deliberate.

Core behavior:
- drag one family card onto a compatible room card
- drag an assigned family from one room to another room
- optionally drag multiple selected families in a batch mode

### Desktop drag cues
While dragging:
- the dragged card lifts slightly
- the target room highlights
- valid drop zones glow with a green or forest-tinted outline
- invalid drop zones show a muted red or dashed warning outline

### Drop behavior
When a family is dropped on a room:
- validate capacity and constraints
- if valid, assign immediately with a visible confirmation
- if invalid, show why it failed and do not mutate data

### Accessibility fallback
Because drag and drop can be awkward on some devices and for some users, every drag action must have a non-drag fallback:
- `Assign` button
- room picker dialog
- keyboard navigation for room focus

### Drag state clarity
The UI must always show:
- what is being dragged
- where it can be dropped
- why a drop target is invalid

Avoid hidden drag logic that only becomes clear after failure.

## Room Cards

### Card contents
Each room card should show:
- building name
- floor
- room number
- room type
- capacity
- current occupancy
- assignment status

### Room card hierarchy
Room cards should be readable in under two seconds:
- room number is the hero text
- room type and capacity are secondary chips
- occupancy is visual
- assigned families are compact labels or stacked pills

### Visual states
Room cards should have distinct states:
- empty
- partially occupied
- fully occupied
- over capacity
- blocked or unavailable
- service space

### Service space treatment
Service spaces such as stairs, elevator, laundry, utility rooms, or corridors should not look like assignable rooms.

They should be:
- visually muted
- non-draggable
- labeled clearly as infrastructure

## Family Cards

### Card contents
Each family card should show:
- family name
- leader
- contact short form if needed
- number of attending members
- gender or building preference if applicable
- current room assignment
- assignment warning badges

### Compactness
Family cards must remain compact because the queue can be long.

Use:
- one strong title line
- a second metadata line
- small status chips
- a clear assignment action affordance

### Special states
Family cards should visually distinguish:
- unassigned
- partially assigned
- fully assigned
- conflict detected
- waiting for auto assignment
- locked or reviewed

### Selection behavior
Selecting a family should:
- highlight the card
- highlight compatible rooms
- bring the best-suggested rooms into view
- open the inspector with assignment actions

## Validation Rules

### Capacity validation
A room cannot exceed capacity unless the system explicitly allows an override mode.

Validation should check:
- total assigned members
- family grouping
- room type capacity
- current occupants

### Room type validation
Room type must match the family’s assignment requirement when such a requirement exists.

Examples:
- 1인실 should only accept a single occupant or explicitly approved exception
- 2인실 should not accept a larger family unless policy allows it
- 4인실 온돌 should be treated differently from bed rooms if the rule set requires it

### Building and floor validation
The UI should respect building-level and floor-level constraints if they are specified in the source data or retreat policy.

### Gender or lodging separation validation
If the retreat policy distinguishes brother and sister lodging, the room picker must mark rooms and families as compatible or incompatible.

### Duplicate assignment validation
A family or member cannot appear in two rooms at the same time.

### Empty state validation
If the workbook or generated data is incomplete, the page must show a clear error state rather than silently rendering a broken map.

### Save-time validation
Before saving assignments:
- confirm all conflicts
- show unresolved warnings
- require an explicit user action for overrides

## Auto Assignment UX

### Entry point
Auto Assignment should be a primary action, not a hidden utility.

Recommended trigger:
- a top-bar button
- a guided modal or side panel

### Auto assignment modes
The page should offer modes such as:
- balanced by capacity
- keep families together
- prioritize special cases
- minimize empty rooms
- manual review after suggestion

### Workflow
1. User chooses auto assignment mode.
2. System previews suggested placements.
3. The UI explains any assumptions.
4. Conflicts are shown before applying changes.
5. User can accept all, accept selected, or reject suggestions.

### Preview-first principle
Do not apply auto assignment silently.

The page should always show:
- what will change
- why each placement was chosen
- which constraints caused compromises

### Confidence display
Suggested placements should carry a confidence indicator:
- high confidence
- medium confidence
- needs review

### Rollback
Users need one-click rollback for the last auto-assignment batch.

## Empty Room UX

### Definition
An empty room is a room with zero assigned occupants and no active pending assignment.

### Empty room appearance
Empty room cards should be calm, not alarming.

They should show:
- room number
- room type
- capacity
- `비어 있음` or equivalent label
- a small action such as `배정 시작`

### Empty room discoverability
Users should be able to find empty rooms by:
- direct filter
- building/floor grouping
- occupancy visualization
- room type filter

### Empty room actions
From an empty room card, the user should be able to:
- assign a family
- mark as temporarily reserved
- exclude from auto assignment
- inspect nearby rooms

## Occupancy Visualization

### Card-level visualization
Each room card should show occupancy visually, not only numerically.

Recommended options:
- horizontal occupancy bar
- circular occupancy ring
- small member pills inside the card

### Map-level visualization
Each floor should expose aggregate occupancy cues:
- percentage of rooms assigned
- count of empty rooms
- count of full rooms
- count of rooms needing review

### Status colors
Use the existing semantic status palette:
- full/assigned: forest green
- partial: warm amber
- conflict or over capacity: soft red
- empty: muted gray
- service space: desaturated neutral

### Accessibility
Never rely on color alone.
Every visual occupancy state needs:
- text
- number
- and a shape or bar difference

## Animations

Animations should feel premium and restrained, not playful.

### Allowed animation types
- card lift on hover
- smooth drawer open/close
- gentle selection highlight
- short confirmation pulse when assignment succeeds
- soft bar-fill animation for occupancy changes

### Disallowed animation types
- bouncy motion
- excessive parallax
- attention-seeking flashing
- long transitions that slow operation

### Suggested timing language
- hover transitions: fast and subtle
- drawer transitions: smooth and decisive
- assignment success: brief confirmation
- validation error: quick, readable shake or pulse only if truly needed

### Motion principle
Motion should explain state changes, not decorate them.

## Empty, Error, and Loading States

### Loading
Show a skeleton or soft placeholder while room data is being prepared.

### Empty
If no rooms are available in a selected filter:
- show a friendly empty state
- explain the filter mismatch
- offer a reset action

### Error
If the Excel-derived data is missing or invalid:
- show a clear structured error
- identify whether the problem is workbook parsing, missing structure, or invalid room rows
- avoid showing a partially broken map without explanation

## Interaction Summary
The ideal workflow on the Room Assignment page is:

1. Open the page.
2. Review room availability and family queue.
3. Drag or assign families into rooms.
4. Validate conflicts.
5. Apply or roll back changes.
6. Export the finalized rooming list.

## Non-Goals
This page should not:
- replace the Excel workbook as the operating source of truth
- introduce a separate hidden room database
- rework existing attendance or permission logic
- change routing or access control
- turn the interface into an ERP-style matrix

## Implementation Reminder
When this page is implemented later, it should reuse the generated room layout assets and preserve the project’s current business rules and permissions.

