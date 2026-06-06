# Project Overview

## What this project is
This repository is a single-page retreat operations dashboard for 주은혜교회 2026 summer retreat management.

It centralizes the day-to-day work that retreat staff usually split across spreadsheets, chat threads, and paper checklists:

- attendance registration and status tracking
- family-level attendance timelines
- sister/brother small-group organization charts
- meal counts and meal timing logic
- room assignment summaries and fee calculations
- a document room connected to Google Drive
- a chatbot workflow for operational Q&A

The application is intentionally built as a browser-first operational tool. Most of the business logic lives in one client-side file, and the page re-renders sections when state changes.

## Core files
- `index.html`: application shell, page sections, drawers, and controls.
- `app.js`: state, data loading, calculations, rendering, Google Drive integration, Supabase sync, chatbot logic, and event handling.
- `styles.css`: visual system, layout, responsive behavior, status colors, cards, drawers, and mobile overrides.
- `retreat-config.md`: retreat configuration source of truth for dates, meal schedule, fees, lodging, and room policy.
- `server.py`: local static server and API shim for development.
- `deploy.sh`: git add, commit, and push automation for production updates.

## Runtime data sources
The app combines four kinds of data:

1. Retreat configuration from `retreat-config.md`
2. Church family roster from a published Google Sheets CSV URL
3. Family attendance records from Supabase
4. Shared document metadata from Google Drive

Those sources feed a shared in-memory state model in `app.js`, then the UI is rebuilt from that state.

## Main user journeys
### 1. Attendance management
Staff can inspect family attendance, edit member schedules, mark whole families absent or undecided, and calculate meal/lodging fees from the selected attendance pattern.

### 2. Small-group organization
The sister-group and brother-group views visualize predefined small groups and overlay each person’s live attendance status.

### 3. Room and fee tracking
Room assignment is stored on each family record as `room`, and the fee logic recalculates lodging cost from the number of attending members and the retreat lodging rules.

### 4. Document sharing
The document room connects to Google Drive using Google OAuth. Files can be browsed, searched, opened, copied, moved, trashed, and uploaded depending on the signed-in Google account’s Drive permissions.

### 5. AI support
The chatbot can answer operational questions and update family status when the model returns structured actions.

## Data model at a glance
### Family record
Each family entry typically includes:

- `id`
- `name`
- `leader`
- `phone`
- `status`
- `fee`
- `feeStatus`
- `room`
- `memo`
- `members`

### Member record
Each member is represented as an array with attendance-related fields:

- name
- group
- arrival
- departure
- selected dates
- selected periods
- external meal periods
- undecided flag

## Rendering model
The app is not component-based. Instead, it uses imperative rendering functions:

- compute current state
- write HTML strings into containers
- refresh icons with Lucide
- attach behavior through delegated event listeners

That design keeps the application simple to deploy on static hosting, but it also means a change in one state slice can trigger a full section re-render.

## Deployment model
Production updates are deployed with `deploy.sh`, which stages the main web files, creates a git commit, and pushes to `origin/main`.

For local development, `server.py` can serve the app and provide a lightweight API shim for configuration and Google Drive testing.

## Operational note
This project is optimized for a retreat staff team, not for public self-service.
That is why the UI favors:

- dense information display
- fast state edits
- clear attendance status colors
- readable mobile fallback layouts
- shared-document access with Google authentication

