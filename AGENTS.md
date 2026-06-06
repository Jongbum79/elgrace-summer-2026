# AGENTS

## Repository purpose
This repository is a retreat operations dashboard for 주은혜교회. The application is a static front-end with browser-side logic and a few local/development support files.

## Product principles
Future agents must preserve the product identity below.

- Use Apple design language as the primary visual reference.
- Use Linear design language as the primary interaction and spacing reference.
- Aim for a premium SaaS dashboard feel, not a generic admin panel.
- Use the Lucide icon system consistently.
- Prefer a mobile-first philosophy for layout decisions and interaction depth.
- Treat Excel as the single source of truth for room layout and any workbook-driven operational data.
- Avoid ERP-style density, labels, chrome, and hierarchy.
- Avoid Bootstrap admin template aesthetics, patterns, or spacing.

## Primary files
- `index.html`: application shell and page containers
- `app.js`: global state, rendering, integrations, and event handling
- `styles.css`: layout, responsiveness, colors, and component styles
- `retreat-config.md`: retreat configuration source of truth
- `server.py`: local development server and API shim
- `deploy.sh`: automated git deployment script

## Working rules
### Do
- Read the existing structure before making assumptions.
- Keep documentation and implementation aligned.
- Prefer small, targeted changes.
- Preserve the existing visual language unless the user asks for a redesign.
- Preserve existing business logic unless the user explicitly requests a behavior change.
- Preserve existing APIs, routes, and permission boundaries unless the task specifically requires changing them.
- Prefer data-driven generation when the source workbook or config file already contains the truth.
- Use `deploy.sh` when the user wants changes committed and pushed.
- Treat `retreat-config.md` as the operational source of truth for dates, fees, and meal rules.
- Follow the current product vocabulary:
  - keep Korean operational labels in the UI
  - keep status names stable
  - avoid introducing duplicate terms for the same state

### Do not
- Do not revert user changes that are unrelated to the task.
- Do not use destructive git commands unless explicitly requested.
- Do not rename or split core globals casually.
- Do not introduce a second source of truth for attendance, fee, or room data.
- Do not assume the document room or room assignment screens are fully modular if the current source still wires them through shared page logic.
- Do not change routing behavior unless the user asks for routing changes.
- Do not change permission rules unless the user asks for permission changes.
- Do not replace the current dashboard with an ERP-style table-heavy interface.
- Do not restyle the product into a Bootstrap-like admin template.

## Architecture notes
- The app is rendered imperatively, not with a component framework.
- Many sections are rebuilt by string templates and `innerHTML`.
- Event delegation is used heavily.
- Shared state lives in module-level variables.
- Mobile behavior is implemented mainly through `body.mobile-mode` CSS overrides.
- Excel-derived artifacts must be generated from the workbook, not manually hand-edited as a separate truth source.

## Coding conventions
### JavaScript
- Prefer clear, readable imperative code over clever abstractions.
- Keep business rules close to the functions that use them when that makes the flow easier to audit.
- Reuse existing utility functions for normalization, parsing, and status derivation.
- Avoid adding new global variables unless the feature truly needs shared state.
- If a behavior is already represented by a helper, extend the helper instead of duplicating the logic.

### HTML and rendering
- Prefer existing section structure and card patterns.
- Use semantic labels and icons together.
- Keep interactive controls reachable on mobile.
- Keep drawers and modals narrow in scope.

### CSS and visual rules
- Favor rounded cards, soft borders, calm shadows, and ample whitespace.
- Use forest/sage neutrals as the primary brand language.
- Use status colors consistently across cards, badges, borders, and charts.
- Keep icon stroke weights and sizing consistent with Lucide usage.
- Avoid hard edges, saturated neon accents, and crowded chrome.

## Design conventions for future agents
- Start from the existing Apple/Linear-inspired system instead of inventing a new theme.
- Preserve the premium dashboard feel when adding new sections.
- When a status appears in multiple places, make its color semantics consistent across all views.
- Keep desktop and mobile variants aligned in function, even if their layout differs.
- Use compact but readable information hierarchy: title, subtitle, status, then detail.
- Prefer progressive disclosure with drawers, cards, and segmented controls over large modal workflows.

## Integration notes
- Google Drive access depends on Google OAuth plus Drive permissions.
- Supabase is used for family record persistence.
- Google Sheets CSV is used for roster lookup.
- The chatbot can emit structured actions that mutate retreat data.

## Documentation expectations
If you update behavior, update the relevant docs in `docs/` and keep terminology consistent with the app:

- “풀참” means full attendance
- “부분참석” means partial attendance
- “불참” means absent
- “미정” means undecided
- “미배정” means unassigned room

## Deployment reminder
When the user asks for git reflection or deployment, use the repo’s deployment script rather than manual git steps.
