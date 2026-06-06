# Drag and Drop Architecture

## Current interaction model
The app does not rely on native HTML5 drag-and-drop for its core attendance editing workflow.

Instead, it uses pointer-driven selection that behaves like drag painting:

- `pointerdown` on an attendance segment toggles the first cell
- `pointerover` continues the same selection across adjacent cells in the same row
- `pointerup` and `pointercancel` end the gesture

This gives users a fast touch-friendly way to mark attendance periods without depending on browser drag events.

## Where it is used
The attendance editor in the family registration modal is the primary area using this pattern.

The same row can be quickly filled or cleared by dragging across the period buttons.

## Internal state
The drag state is held in a lightweight object:

- the active row
- the selected state after the initial toggle

That is enough to keep the pointer-over behavior consistent while the user moves horizontally across a row.

## Why this approach was chosen
The pointer-based model is better than a traditional drag-and-drop API for this product because:

- it works well on both mouse and touch
- it maps naturally to “paint the schedule” behavior
- it is simpler than managing draggable sources and drop targets
- it matches the grid-based attendance UI

## External drag/drop-like areas
The document room includes file and folder browsing, but it is action-based rather than drag-based.

The current UI supports:

- open
- search
- copy
- move
- trash
- upload

It does not yet provide folder-to-folder drag movement.

## Extension guidance
If true drag-and-drop is added later, keep the current pointer model as the fallback for mobile and accessibility.

That way the product keeps its fast schedule editing behavior even if a richer desktop interaction is layered on top.

