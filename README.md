# AttendEase - Student Attendance Tracker

React (Create React App) + Tailwind CSS v3 + React Router v6. No backend: all demo data lives in LocalStorage.

## Run
```bash
npm install
npm start          # http://localhost:3000
npm run build      # production build in /build
```
Node 18+ recommended.

## Features
- Home dashboard: stats computed from attendance records, bar chart, summary ring, recent table, holidays API.
- Student Profiles: add / edit / delete (with confirmation), search, filter, sort, profile modal, table (desktop) and cards (mobile).
- Attendance: pick date/department/year/subject, mark many students, one record per student per date (edits update it), daily totals.
- Reports: date, department and year filters, student/subject/monthly breakdowns, trend chart, low-attendance list, print, CSV export.
- Student Performance: marks (editable), weak subjects (<50%), assignments, skills, activities, achievements, summary.
- Light/dark mode, toasts, skeleton loaders, empty states, mobile menu.

Attendance % = (Present + Late + OD) / total recorded entries. Zero records show 0% and "No data".
Categories: 90-100 Excellent, 75-89 Good, 60-74 Low, below 60 Critical.

Holidays are loaded from `/.netlify/functions/holidays`, a Netlify Function that calls the Calendarific API server-side. Set the full upstream URL (including `api_key`) in the `HOLIDAY_API_URL` Netlify environment variable — never in a `REACT_APP_*` variable, since those are embedded in the public JavaScript bundle.
`GET https://date.nager.at/api/v3/PublicHolidays/2026/IN` (set `REACT_APP_HOLIDAY_API_URL` to change; see `.env.example`).
Failures show a message and a Retry button; the rest of the app keeps working. An empty/204 response shows an empty state.
Note: external availability and coverage are not guaranteed.

## Deploy (Netlify)
`netlify.toml` and `public/_redirects` already provide the SPA fallback, so refreshing any route works.
Build command `npm run build`, publish directory `build`. `"homepage": "."` keeps asset paths relative.

## Screenshots
Add images to a `screenshots/` folder and link them here.

## Verification checklist
- [ ] `/`, `/student-profiles`, `/attendance`, `/reports`, `/student-performance` load; refresh works; unknown URL shows 404 page
- [ ] Add, edit, delete a student; invalid email/phone shows errors
- [ ] Mark attendance, save, change status, save again (no duplicate rows); Home and Reports numbers change
- [ ] Reports filters change every total; CSV downloads; Print opens
- [ ] Edit marks (0-100 validated); a subject below 50 is flagged
- [ ] Disconnect network and reload: holidays card shows error + Retry, rest of app works
- [ ] Dark mode toggle and mobile menu work
