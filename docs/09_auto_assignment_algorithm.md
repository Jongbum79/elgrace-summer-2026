# Auto Assignment Algorithm

## What the current system does
The current codebase contains room-cost logic and room-visibility logic, but it does not ship a fully separate room auto-assignment engine.

What it does today is:

- infer room type from the number of attending members when estimating fee
- preserve the `room` field on each family record
- show room assignment in lists, exports, and lookups

## Current assignment-related rules
### Family attendance count
The app counts attending members by checking the selected attendance periods and the undecided flag.

### Lodging class selection
The fee estimator converts attendee count into a room type:

- 1 member -> 1인실
- 2 members -> 2인실
- 3 to 4 members -> 4인실
- 5+ members -> 6인실

### Cost calculation
The lodging cost is computed as:

`room rate x number of nights`

Then meal cost is added on top of it.

## Why this matters for room assignment
Even without an explicit auto-allocator, the code already encodes the constraints that a future allocator would need:

- family size
- attendance window
- room type pricing
- persisted room field
- retreat dates and nights
- brother/sister separation as an operating principle in the retreat config

## Existing business rules the allocator should respect
From `retreat-config.md`:

- same family should be kept together when possible
- families with infants or reduced mobility should be prioritized
- brother and sister accommodations should generally be separated

## Recommended algorithm design for future implementation
If auto-assignment is implemented later, the safest approach is:

1. group by family
2. calculate eligible headcount
3. determine room capacity bucket
4. rank special-priority families
5. place families into room pools by gender/building constraints
6. write the chosen room back to `family.room`
7. re-render fee and export views

## Important architectural warning
Do not build a new hidden room state separate from `family.room`.

If the room assignment engine writes to a different structure, exports and chatbot lookups will drift out of sync.

