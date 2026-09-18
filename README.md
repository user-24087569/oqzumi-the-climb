# OQZUMI: The Climb

An endless, procedurally-generated brain-training climb — Memory, Math, Attention, and
Logic puzzles that keep getting harder, with checkpoints, a named companion, lifetime
stats, and a dedicated skill-practice mode.

This is a working Expo (React Native) project, ported directly from the validated HTML
prototype. The game logic (`src/game/logic.js`) is a 1:1 port of the prototype's
formulas — same difficulty curves, same rank thresholds, same checkpoint math.

## Run it

```bash
npm install
npx expo start
```

Then scan the QR code with the **Expo Go** app on your phone (iOS or Android) to play
it live, no build step required. This is the fastest way to feel the game on a real
device while we keep iterating.

## Project structure

```
App.js                        — navigation + persisted state (theme, name, stats)
src/game/logic.js              — pure game logic: ranks, checkpoints, puzzle generators
src/game/dialogue.js           — companion speech lines
src/storage.js                 — AsyncStorage read/write helpers
src/theme.js                   — light/dark color tokens
src/components/Mascot.js       — the companion, as SVG
src/components/UI.js           — shared Button / Bubble / Card
src/screens/                   — one file per screen (Home, Run, Practice, Profile, ...)
```

## What's ported 1:1 from the prototype
- All 4 puzzle generators and their difficulty-scaling formulas
- Rank tiers and checkpoint-every-10-levels system
- Lifetime stats, weakest-skill detection, companion dialogue
- Practice Mode (train one skill type, no lives)
- Hint system, streak bonus life, light/dark theme toggle

## What's simplified here vs. the HTML prototype (worth polishing next)
- No confetti burst or drifting background blobs yet (easy to add with
  `react-native-reanimated` or Lottie)
- Timer bar updates every ~60ms via `setInterval` rather than a smooth CSS transition —
  fine for now, but `react-native-reanimated` would make it buttery
- No app icon / splash image yet — drop a 1024×1024 PNG into `assets/icon.png`

## Next steps
1. `npm install && npx expo start` — get it running on your phone today
2. Polish animations and add the confetti/blob background
3. Design a real app icon (the mascot works great as a starting point)
4. When ready for the app stores: `npx eas build` (Expo's cloud build service —
   produces both the Android `.apk`/`.aab` and the iOS `.ipa`, no Mac required)
