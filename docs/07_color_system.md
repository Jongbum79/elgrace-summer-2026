# Color System

## Philosophy
Color is used as an information system, not decoration.

The palette is intentionally restrained so that status colors remain meaningful under pressure.

## Core theme colors
These are the main design tokens in `styles.css`:

- `--ink`: `#1A1A1A`
- `--muted`: `#666666`
- `--background`: `#FAF8F3`
- `--card`: `#ffffff`
- `--forest`: `#184E3A`
- `--forest-dark`: `#0F3A2A`
- `--sage`: `#DDE8E1`
- `--mint`: `#F0F5F2`
- `--gold`: `#D6A94E`
- `--orange`: `#f7a45c`
- `--blue`: `#6c9ecf`
- `--pink`: `#d9879f`
- `--yellow`: `#e3bf62`
- `--purple`: `#917bb7`

## Semantic status colors
### Family and org status borders
The left border of family cards and organization nodes is the canonical status color:

- full or stay: `#3F7D58`
- partial or late: `#C98A2E`
- absent or leave: `#C66A6A`
- undecided: `#B8B8B8`
- unregistered / not_in_db: `#E2E8F0`

### Organization status dots
The small dots inside the org chart are softened versions of the border colors:

- full: `#7FA18A`
- partial: `#D8B36A`
- absent: `#D89A9A`
- undecided: `#CBCBCB`
- unregistered / not_in_db: `#EDF2F7`

### Status badges in the org summary bar
The top summary bar uses readable fills that are a little softer than the border colors:

- partial: `#E4C07A`
- absent: `#E0A0A0`
- undecided: `#D0D0D0`

## Department and age-group colors
The school view uses department-specific colors:

- 중고등부: `#475569`
- 초등부: `#A37B24`
- 유년부: `#184E3A`
- 유치부: `#AC6D80`
- 유아부: `#5F8B77`

The birth-year mapping adds more granular shades inside the department cards.

## Drive file colors
Google Drive file cards use semantic MIME colors:

- PDF: red
- spreadsheet: green
- document: blue
- generic file: gray

This keeps file browsing fast without reading every filename.

## Room and fee colors
Room and fee areas intentionally use the forest/sage family so they feel operational rather than financial-institution blue.

## Color rules to preserve
- Do not introduce a new accent color unless it carries meaning.
- Keep the status palette consistent across cards, badges, charts, and exports.
- Use stronger color on the border and slightly softer color for supporting dots or chips when the same state appears in multiple places.

