# How to add a design

1. **Copy the template**
   ```bash
   cp -r templates/design-template designs/my-new-design      # slug: lowercase-with-dashes
   ```
2. **Fill it in.** Keep the same files so every design looks the same to a reader (and to an AI):
   `README.md`, `brief.md`, `prompt.md`, `tokens.css`, `design.json`, `screenshots/`, optional `reference/`.
3. **Screenshots.** Number them in reading order: `01-hero.jpg`, `02-...`. Use JPG quality about 84 to keep the repo small.
   Cover: the main screen, one data screen, one pop-up or special component, and the phone version.
   Name them with the device at the end (`-desktop`, `-phone`).
4. **Write the brief with real numbers.** Colours as hex, sizes in rem, radii, shadows, spring settings, breakpoints.
   Always include a "What it is NOT" list. These rules are what stop an AI from drifting back to a generic look.
5. **Record what you learned.** Put performance traps and fixes in the "Performance lessons" section.
6. **Update the index** (it reads every `design.json`):
   ```bash
   python3 scripts/update-index.py
   ```
7. Commit.

## Naming
- Folder = slug in `design.json` = lowercase with dashes (`gmu-erp-glass`, `night-market-dark`).
- `status`: `idea`, `in-progress` or `shipped`.
- `tags`: style words (glassmorphism, brutalist, dark, light-mode), product type (dashboard, landing, mobile), and layout ideas (island-nav, sidebar, bento).

## Before making the repo public
- Remove anything private from `reference/` (keys, internal URLs, real names, real student data) and check screenshots for the same.
- Check that logos and brand images are yours to share (or blur or replace them).
- Add a `LICENSE` file (MIT is a common choice for this kind of repo) and decide what licence the designs themselves use.
