# Room Assignment

## Purpose
Room assignment is part of the family record and fee logic rather than a separate isolated data silo.

The app treats room assignment as an operational property of each family:

- it appears in family cards
- it appears in fee summaries
- it appears in exports
- it is stored with the family record

## Current data flow
### Source of truth
`family.room` holds the current room assignment.

### Default state
When a family is created or loaded without room data, the app falls back to:

- `미배정`

### Storage
The room value is preserved when family data is saved and synced.

## Room sizing logic
The application derives lodging cost from the number of attending members:

- 1 attendee -> 1인실
- 2 attendees -> 2인실
- 3 to 4 attendees -> 4인실
- 5 or more attendees -> 6인실

That cost model is used for fee estimation and output, even though the UI does not currently expose a full automated room-assignment engine.

## What is visible today
Room assignment is visible in:

- family list cards
- family table rows
- school list exports
- org list exports
- chatbot family lookups

## Important limitation
The navigation shell includes a `방 배정` entry, but the current `openPage()` routing only activates:

- attendance
- participants
- meals
- chatbot
- docs

So the room assignment page is represented in the shell and in data handling, but it is not yet a separate routed screen in the current client build.

## Recommended interpretation for future work
If a dedicated room-assignment interface is added later, it should build on the existing family `room` field rather than inventing a parallel data model.

That will keep:

- fee logic consistent
- exports consistent
- chatbot responses consistent
- Supabase records consistent

