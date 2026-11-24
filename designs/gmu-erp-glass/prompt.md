# Prompts: GMU ERP glass

Paste one of these into a new project (Claude Code, Cursor, v0, ChatGPT, anything).
For the best result also attach `tokens.css` and mention that `brief.md` has the full rules.

## 1. Full prompt (paste into a new project)
```
Build the UI in a soft, light glassmorphism style for a college ERP web app (a website, not a desktop-app look: no window title bars or traffic-light dots).

Palette: warm cream background #f6f2ec with a fixed "wallpaper" of faint blush and gold radial gradients; accents maroon #8c4a4e and gold #c6a258; text #564a44 (never pure black, low contrast, light mode only). Status colours are muted: green #4e8a6a, red #b0605a.

Material: panels are translucent warm white rgba(255,251,246,.66) with a 1px white border (bottom edge slightly brown), an inset top highlight, a soft warm shadow, and 1.25 to 1.75rem radius. Do NOT use backdrop-filter blur on large panels, because animated content behind them makes the page stutter; make panels slightly more solid instead. Blur is allowed only on small elements like the nav.

Navigation: a floating pill "island" at the top with logo, icon-only tabs where the current tab expands to show its label, and a white highlight pill that glides between tabs (Framer Motion shared layoutId, spring). Hovering a tab prefetches its data. A clock with a day-progress ring opens a mini month calendar (holidays maroon, exams gold, events green; admin can add or remove dates). On phones: a slim top header and a floating bottom tab bar with icons only that fits 8 tabs at 320px.

Home: a small greeting, a huge maroon name (clamp 2.3 to 3.7rem, weight 750, tracking -.04em), a one-line subtitle, key numbers as plain large figures with thin dividers (no boxes; turn red under a threshold), and one prominent "Today" glass card with the next class, a live countdown, a day progress bar and P1 to P6 dots. Below: a pill search that filters the feature directory, light rounded panels (Study, Campus) of icon rows with one-line notes and thin dividers (a chevron slides in on hover), then an agenda list (big date, title, venue) and a notice timeline with gold dots. No "coming soon" items, no dead buttons.

Data screens: tables inside a glass container with a tinted header and clickable course names; on phones each row becomes a card. The weekly time table is a CSS grid whose blocks each fill their whole cell (not a table), with hover lift; on phones show one day at a time with day tabs. Clicking any subject opens a centred solid-cream pop-up with code, name, credits, teacher, weekly meeting times, attendance (big %, bar, how many classes to reach 75%) and marks (CIE, SEE, grade); it has a round x, Done, closes on Esc or outside click, never exceeds the window height.

Controls: pill buttons (primary is a gold gradient #f8e9c4 to #ecd49b with text #6a5226), inset rounded fields with a gold focus ring, toggle switch, segmented filter with counts and status dots, tag pills, thin progress bars, a confirm sheet instead of browser confirm (destructive actions in soft red), and toasts that drop under the island (success auto-hides after 4.5s, errors stay).

Sign-in: a centred card with the university logo as a rounded square, "Welcome back", fields, show/hide password, caps-lock warning, "keep me signed in" switch, gold Sign in button, demo account chips, and specific errors (tries left, locked 15 minutes, turned off). First sign-in forces choosing a new password.

Type and scale: system font stack, sentence case (no all caps), tabular numbers, rem units with a fluid root font-size clamp(15px, 12.5px + .29vw, 19px), 16px inputs on phones. Motion: spring easing, pages fade and slide 10px in .24s, pop-ups spring in, everything off under prefers-reduced-motion. Add a few faint maroon and gold leaves drifting behind the content on a canvas (react-snowfall with custom leaf images), off for reduced motion.

Performance: cache API answers and show them instantly while refreshing, reserve space with placeholders so nothing jumps, no decorative images, no web fonts.

Stack: React, TypeScript, Vite, React Router, Framer Motion, Lucide icons, hand-written CSS with design tokens as CSS variables.
```

## 2. Short prompt
```
Soft light glassmorphism college-ERP web UI: cream #f6f2ec wallpaper with faint blush/gold gradients, maroon #8c4a4e + gold #c6a258 accents, text #564a44, translucent warm-white rounded panels (no blur on big panels), floating pill "island" nav with a gliding white active pill, clock that opens a mini calendar, huge maroon name + plain big-number stats + one "Today" next-class card, icon-row directory panels, agenda and notice timeline, tables that become cards on phones, full-cell time-table blocks, subject pop-ups, spring animations, faint falling leaves, no dark mode, no window dots, no "coming soon". React + TS + Framer Motion + Lucide.
```

## 3. Adapt to another domain
```
Use the design system in erp-ui.md (soft light glassmorphism, island nav, plain figures, light panels, spring motion) for a <HOSPITAL / SHOP / GYM> dashboard. Keep the tokens and component rules, but change the accents to <COLOURS>, the logo, and the content. Home needs: greeting + name, three key figures, one prominent "next up" card, a feature directory, an agenda list and a notice timeline.
```

