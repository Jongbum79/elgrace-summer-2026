# Icon System

## Icon sources
The project primarily uses Lucide icons through the browser script import in `index.html`.

Icons are used for:

- navigation
- section headings
- stats
- quick actions
- file type markers
- drawers and helper buttons

## Principles
Icons support the text, they do not replace it.

Every important icon is paired with a label so the interface remains readable even if the icon fails to render.

## Common navigation icons
- `house`: home/dashboard
- `users`: participants
- `bed-double`: room assignment
- `utensils-crossed`: meal management
- `calendar-days`: schedule
- `sparkles`: chatbot
- `folder`: document room

## Repeated utility icons
- `download`
- `plus`
- `pencil`
- `chevron-down`
- `search`
- `crown`
- `clipboard-list`
- `external-link`
- `file`
- `file-text`
- `file-spreadsheet`
- `more-vertical`

## Icon styling patterns
The codebase uses a consistent set of style rules:

- small stroke widths
- muted default tones
- brand-green emphasis on active states
- compact sizing in badges and buttons

## Status icon behavior
In the participant org charts, the tiny status dot is a semantic icon, even though it is rendered as a CSS circle rather than SVG.

It mirrors the person’s attendance state:

- full
- partial
- absent
- undecided
- unregistered
- not_in_db

## File-type icons in Google Drive
Document cards use a file-type map to choose icons and colors based on MIME type and filename extension.

That helps the document room stay scannable even when file names are long.

## Design rule for new icons
When adding a new icon:

- pair it with a text label if the action matters
- keep the stroke weight consistent
- avoid adding a new icon style if an existing one already communicates the same meaning

