# Ritual — Daily Habit Tracker

A daily habit tracker built with **React** (via [Vite](https://vitejs.dev)). No backend, no
database, no login — everything is stored locally in your browser (`localStorage`).

## Features

- **Core tracking** — add/edit/delete habits (name, category, icon, color); daily check-in
  as done/not-done or a quantity (e.g. "8 glasses"); custom frequency (daily, specific
  weekdays, or X times a week); live current + longest streaks.
- **Visualization** — GitHub-style calendar heatmap, weekly/monthly completion charts
  (Chart.js), and a Today dashboard with a progress ring.
- **Motivation** — streak milestone badges (3–365 days), a motivational quote toast on
  completion, and optional browser notifications for reminders (while the tab is open).
- **Organization** — category filters, archive/unarchive, manual reordering.
- **Data** — local persistence, CSV/JSON export & backup, and a reset option.

## Project structure

```
ritual-react/
├─ index.html            # Vite entry HTML
├─ package.json
├─ vite.config.js
└─ src/
   ├─ main.jsx           # React root
   ├─ App.jsx            # top-level state + layout
   ├─ index.css          # all styling
   ├─ constants.js        # categories, icons, colors, quotes, etc.
   ├─ utils/
   │  ├─ dateUtils.js     # date helpers
   │  ├─ habitLogic.js    # streaks, scheduling, stats, heatmap data
   │  └─ storage.js       # localStorage + file download helpers
   └─ components/
      ├─ HabitCard.jsx
      ├─ HabitForm.jsx     # add/edit modal
      ├─ TodayView.jsx
      ├─ HabitsView.jsx    # manage habits
      ├─ StatsView.jsx
      ├─ SettingsView.jsx
      ├─ Heatmap.jsx
      ├─ ChartCanvas.jsx
      ├─ RingProgress.jsx
      └─ Toast.jsx
```

## Getting started

Requires [Node.js](https://nodejs.org) 18+.

```bash
npm install     # install dependencies
npm run dev     # start the dev server (http://localhost:5173)
npm run build   # build for production into dist/
npm run preview # preview the production build locally
```

## Deploying

`npm run build` outputs a static `dist/` folder — you can host it anywhere that serves
static files: Vercel, Netlify, GitHub Pages, or your own server. No server-side code or
database is required.

## Notes

- All data lives in the browser's `localStorage`. Clearing browser data or switching
  devices/browsers means starting fresh — use Settings → Export to back up your data first.
- Notifications only fire while the app's tab is open, since there's no backend to send
  push notifications when the tab is closed.
