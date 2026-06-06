# Dashboard

## Purpose
The dashboard is the first operational screen. It answers three questions immediately:

1. How many people are coming?
2. What is the current attendance mix?
3. What does the retreat day look like right now?

## Main sections
### Retreat hero
The top hero area establishes the retreat identity and displays the retreat theme, location, and dates.

### Date switcher
The retreat date tabs let staff move across retreat days and recalculate charts and counts for the selected day.

### Summary stats
The stats grid summarizes:

- total people
- attendance
- meal counts
- room assignment rate
- fee-related or attendance-related indicators depending on the current viewport

### Time-series attendance
The attendance flow chart shows attendance by time slot and category, so staff can see movement across the day rather than a static total.

### Attendance breakdown
The donut-style breakdown emphasizes category share for the selected time slot.

### Quick actions
Quick actions are shortcuts to the major work areas:

- attendance management
- room assignment
- meal management
- schedule
- chatbot
- document room

## How the dashboard is computed
The dashboard is not manually maintained. It is derived from state:

- retreat dates come from `retreat-config.md`
- attendance flows are derived from the current selected date and static sample series
- family status and meal counts are derived from `families`
- room assignment progress is derived from families whose `room` value is not `미배정`

## What makes the dashboard operationally useful
- It provides a “what changed?” snapshot without opening a record.
- It gives enough context for fast decisions during check-in, meal prep, and room finalization.
- It keeps the retreat identity visible, which helps staff stay oriented while navigating details.

## Mobile behavior
On mobile, the dashboard condenses into:

- a two-column stats grid
- stacked cards
- simplified spacing
- bottom navigation

The mobile layout keeps the same logic but reduces the visual load.

