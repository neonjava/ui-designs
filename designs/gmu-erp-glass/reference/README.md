# Reference code

These files are copied from the real project (`neonjava/gmu-erp`) so you can read exactly how the design was built.
They are **reference, not a drop-in package**: they import project files that are not here (API helpers, hooks, router).
Copy the parts you need, or hand this folder to an AI as "build something with this structure".

- `shared.css`: the main stylesheet (tokens, glass, island, panels, buttons, fields, phone rules).
- `react.css`: styles for the React pages (home panels, pop-ups, calendar, time table grid, phone cards).
- `components/`: `Island` (nav), `Today` (next-class card), `SubjectBrief` (pop-up), `MiniCalendar`, `Leaves`, `feedback` (toasts and confirm sheet), `Dashboard` (home), `Student-pages` (tables and time table).
