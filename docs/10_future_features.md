# Future Features

## Goals for future evolution
The current dashboard is already operational, but there are several natural next steps that would make it stronger for real retreat operations.

## High-value feature ideas
### 1. Dedicated room assignment screen
The shell already includes a room menu entry, so the next step is to turn that into a true routed view with:

- room pools
- gender separation
- capacity summaries
- move suggestions
- manual override support

### 2. Constraint-aware auto assignment
Build a guided room allocator that respects:

- family cohesion
- mobility needs
- sibling separation
- available room inventory
- room capacity

### 3. Conflict and exception panel
Add a view that lists:

- families with missing contact data
- people with no attendance periods
- people who are marked undecided
- families whose room assignment is still `미배정`

### 4. Better Drive file actions
The document room could gain:

- folder creation
- bulk selection
- drag-to-folder move
- richer preview panels
- permission-aware sharing hints

### 5. Audit trail
Operational changes would benefit from a log of:

- who changed a family
- when attendance was updated
- when a room changed
- when files were moved or deleted

### 6. Export presets
Useful export views could include:

- meal vendor sheet
- rooming list
- check-in list
- counselor sheet
- emergency contact sheet

### 7. Offline-friendly fallback
The app could cache more of the retreat roster and configuration so the dashboard remains useful during unstable venue Wi-Fi.

## UI/UX enhancements that fit the existing system
- a real room map
- bulk selection for org charts
- keyboard shortcuts for attendance editing
- an inline search highlight in the document room
- a compact “today’s priorities” panel

## Technical improvements worth considering
- split `app.js` into focused modules
- move sensitive configuration out of source files
- introduce a shared status dictionary to reduce duplicate color logic
- add automated tests for attendance and fee calculations
- make the Google Drive integration permission feedback more explicit

## Product principle for future work
Every new feature should reduce staff time during retreat week.

If a feature does not help someone answer a question, find a person, move a file, or finalize a meal/room decision faster, it should probably wait.

