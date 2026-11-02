# Muscle Studio

React + Vite mobile-first strength training studio prototype.

## Run

```bash
npm install
npm run dev
```

## Deploy

- Cloudflare Pages framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Node.js 20+ recommended.

## Data

The initial prototype uses browser `localStorage` (`muscle-studio-react-v1`). Data is **not** synced between devices. Use the JSON backup action on Home. Supabase Auth/DB and cross-device synchronization are **not implemented** in this version.

## Main features

- Home dashboard and body-area filter, editable body areas
- Exercise technique library with editable muscle group, equipment, notes, video links, progression targets
- Sequence editor, exercise ordering, per-set weight/reps/RIR/complete tracking, rest countdown
- Multiweek program creation with weekly schedule, training goal and progression strategy
- Personal bests, training volume and activity history
- Next-training suggestion based on the most recent completed exercise session, not applied until a new workout starts

Limitations: program week buttons are for browsing repeating weekly schedules; per-week exercise overrides and full calendar scheduling are future work. Advanced adaptive progression, audio coaching and Supabase synchronization are not implemented. Recommendations are simple heuristics, not clinical advice.
