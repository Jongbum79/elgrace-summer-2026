# Room Layout Rules

This file documents how the room layout assets were inferred from the Excel workbook.

## Source of truth
- Workbook: `숙소배정표.xlsx`
- The parser reads the sheet text and cell positions directly.
- No room numbers are hardcoded into the generator.

## Inference rules
1. Section headers are detected from the `B` column text such as `휴락동4층` or `동락홀2층`.
2. Room cells are detected with the pattern `###호` and optional room-type suffixes in parentheses.
3. Explicit suffixes override inference:
   - `침대1` -> `single` -> capacity `1`
   - `침대2` -> `twin` -> capacity `2`
   - `N인실` -> capacity `N`
4. When a room has no explicit suffix, the floor default is used.
5. The floor default is the most common explicit room type found in that floor block.
6. If a floor has no explicit room-type labels, workbook-specific heuristics are applied.
   - `휴락동 3층` unlabeled rooms are interpreted as `4인실 온돌`.
   - other unlabeled rooms fall back to `2인실`.
7. Corridor relationship is inferred from the room row relative to the corridor row in the same floor block.

## Current workbook findings
### 휴락동
- 4층: 25개 방, corridor row 7, room types: 1인실 3개, 2인실 22개
- 3층: 25개 방, corridor row 17, room types: 4인실 온돌 25개
- 2층: 23개 방, corridor row 27, room types: 2인실 23개

### 동락홀
- 2층: 10개 방, corridor row 37, room types: 12인실 2개, 6인실 8개

## Regeneration
Run the generator again whenever the Excel workbook changes:

```bash
python3 scripts/generate_room_layout.py --input /path/to/숙소배정표.xlsx
```

The output files will be overwritten in `assets/`.
