# OneFlaw

An educational security-puzzle game built with Expo. Five fictional mini-sites,
each hiding exactly one security flaw (IDOR, client-side OTP, price tampering,
coupon stacking, hidden admin toggle). The player pokes at a fake in-app
"browser" until the flaw fires, then a reveal card explains the vulnerability.

## Stack

- Expo SDK 54, expo-router (typed routes), React Native 0.81, React 19
- NativeWind v4 (Tailwind classes via `className`), theme in `tailwind.config.js`
- TypeScript strict mode; package manager is npm

## Architecture

- `app/` — routes: `index.tsx` (dashboard), `play/[id].tsx` (loads a puzzle by id)
- `puzzles/` — each puzzle is a self-contained folder exporting a `Puzzle`
  (see `puzzles/types.ts`); `puzzles/registry.ts` is the single list of levels
- `components/game/` — shared game chrome: `GameShell`, `BrowserChrome`,
  `RevealCard`, toasts/banners
- `lib/storage.ts` — local persistence for solved puzzle ids and the first-run
  introduction flag. There is intentionally no backend, no env vars, and no
  network I/O.

## Conventions

- Run `npx tsc --noEmit` and `npm run lint` before considering work done.
- Keep puzzles fictional and self-contained; a new level = new folder in
  `puzzles/` + an entry in `registry.ts`, nothing else.
- Calm dark-neutral UI with one muted sage accent `#789f90` (`text-accent`
  etc. from the Tailwind theme). Avoid neon, glow, and ultraviolet effects.
