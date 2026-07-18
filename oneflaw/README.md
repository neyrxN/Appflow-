# OneFlaw 🐛

A small Expo (React Native) game about spotting security mistakes. Each level is a
fictional mini-site that hides exactly **one** flaw — an IDOR, a client-side OTP
check, a price you can tamper with, a stackable coupon, a hidden admin switch.
Poke around, break it, and read the reveal card to learn what really went wrong.

Everything in the app is fictional. No real sites, people, or systems are involved,
and nothing talks to a network — the whole game runs on-device.

## Requirements

- Node.js 20 or newer (LTS recommended) and npm
- To run on a phone: the free [Expo Go](https://expo.dev/go) app (iOS/Android)
- To run on a simulator: Xcode (iOS) or Android Studio (Android) — optional
- It also runs in a plain web browser, no extra tools needed

## Run it

```bash
cd oneflaw
npm install
npx expo start
```

Then either scan the QR code with Expo Go on your phone, or press `w` (web),
`i` (iOS simulator), or `a` (Android emulator) in the terminal.

That's it — there is no backend, no environment variables, and no account setup.
Progress (solved ✓ badges) is stored locally on the device.

## Scripts

| Command           | What it does                    |
| ----------------- | ------------------------------- |
| `npm run start`   | Start the Expo dev server       |
| `npm run web`     | Start directly in web mode      |
| `npm run ios`     | Start and open the iOS simulator|
| `npm run android` | Start and open Android emulator |
| `npm run lint`    | Lint the project                |

## Project layout

- `app/` — screens (expo-router): dashboard and the `play/[id]` game screen
- `puzzles/` — one folder per level, plus `registry.ts` that lists them
- `components/game/` — the fake in-app "browser" shell and game UI
- `lib/storage.ts` — the only persistence: solved-puzzle ids in AsyncStorage
