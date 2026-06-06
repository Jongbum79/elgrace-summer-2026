# AGENTS

## Repository purpose
This repository is a retreat operations dashboard for 주은혜교회. The application is a static front-end with browser-side logic and a few local/development support files.

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
- Use `deploy.sh` when the user wants changes committed and pushed.
- Treat `retreat-config.md` as the operational source of truth for dates, fees, and meal rules.

### Do not
- Do not revert user changes that are unrelated to the task.
- Do not use destructive git commands unless explicitly requested.
- Do not rename or split core globals casually.
- Do not introduce a second source of truth for attendance, fee, or room data.
- Do not assume the document room or room assignment screens are fully modular if the current source still wires them through shared page logic.

## Architecture notes
- The app is rendered imperatively, not with a component framework.
- Many sections are rebuilt by string templates and `innerHTML`.
- Event delegation is used heavily.
- Shared state lives in module-level variables.
- Mobile behavior is implemented mainly through `body.mobile-mode` CSS overrides.

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

