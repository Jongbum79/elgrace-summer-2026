# Participant Management

## Purpose
Participant Management is the center of the application. It is where staff register people, edit attendance, inspect group structure, and correct data.

## Three operating modes
The participant area has multiple modes:

- family list
- sister group chart
- brother group chart
- church school view

Each mode serves a different operational use case.

## Family management
### What is stored
Each family record contains:

- family name
- representative leader
- phone number
- overall retreat status
- fee status
- room assignment
- memo
- member list

### What can be edited
Staff can:

- add a family
- edit a family
- delete a family
- mark the whole family absent
- mark the whole family undecided
- adjust individual attendance periods

### Attendance model
Attendance is not a single boolean. Each member can have:

- selected arrival/departure periods
- external meal periods
- undecided state
- derived full/partial/absent status

That structure allows more realistic retreat attendance patterns.

## Sister and brother org charts
The org charts visualize predefined ministry groups with live attendance overlays.

### What the chart shows
- group number
- leader name
- member cards
- attendance status dot
- left border color by status
- a filterable summary bar

### Status logic
The system derives a status for each person:

- `full`
- `partial`
- `absent`
- `undecided`
- `unregistered`
- `not_in_db`

These values drive both color and filtering.

### Group detail drawer
On mobile, tapping a group opens a drawer showing all members in that group.

## Church school view
The school view groups children by age or department using birth-year mapping.
It supports both visual cards and a detailed list.

## Key implementation detail
The participant management area is a state-driven workspace. When a family or member is updated, the app re-renders the relevant views and then syncs the database record.

## Why this area is important
This is where most staff time is spent during retreat week:

- finding someone quickly
- correcting attendance
- verifying contact details
- checking room assignment
- confirming special cases

