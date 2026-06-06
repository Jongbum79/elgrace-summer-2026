# 주은혜교회 수련회 운영센터

This repository contains a single-page retreat operations dashboard for managing attendance, room assignments, meals, participant organization, shared documents, and AI-assisted operations for the 2026 summer retreat.

## What it does
- Tracks family attendance and member-level schedules
- Visualizes sister/brother small-group structures
- Calculates meal counts and lodging fees from attendance windows
- Syncs family records with Supabase
- Connects a document room to Google Drive
- Supports an AI operations chatbot
- Provides desktop and mobile layouts from the same codebase

## Project structure
- `index.html` - app shell and page layout
- `app.js` - state, rendering, integrations, and business logic
- `styles.css` - design system and responsive rules
- `retreat-config.md` - retreat dates, meals, room rules, and fee policy
- `server.py` - local development server and API shim
- `deploy.sh` - git add / commit / push deployment script
- `docs/` - architecture and feature documentation

## Documentation index
- [Project Overview](docs/00_project_overview.md)
- [Design System](docs/01_design_system.md)
- [Dashboard](docs/02_dashboard.md)
- [Participant Management](docs/03_participant_management.md)
- [Room Assignment](docs/04_room_assignment.md)
- [Mobile Design](docs/05_mobile_design.md)
- [Icon System](docs/06_icon_system.md)
- [Color System](docs/07_color_system.md)
- [Drag and Drop Architecture](docs/08_drag_drop_architecture.md)
- [Auto Assignment Algorithm](docs/09_auto_assignment_algorithm.md)
- [Future Features](docs/10_future_features.md)

## Local development
The repository includes a lightweight local server for testing.

Typical flow:

1. Open the project in a browser through the local server.
2. Load the retreat configuration from `retreat-config.md`.
3. Confirm Google Drive and Supabase configuration if you are testing integrations.
4. Refresh the participant list after making backend changes.

`server.py` exists to make this easier during development, especially when testing local API-like behavior around configuration and document access.

## Deployment
Use `deploy.sh` for production updates.

The script stages the web app files, creates a commit, and pushes to `origin/main`.

## External services
- Supabase for family record persistence
- Google Sheets CSV for church family lookup data
- Google Drive API for document room access
- Google Identity Services for Google login
- OpenAI / Gemini for AI chatbot responses

## Operational note
This app is designed for internal retreat staff use. The shared data model and integrations assume a trusted operating team rather than public anonymous users.

