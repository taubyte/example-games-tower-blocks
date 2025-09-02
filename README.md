## Tower Blocks

A small browser game where you stack moving blocks as high as possible. This repository contains the Vite + TypeScript front‑end, with optional integration to a simple leaderboard API.



<img width="1133" height="693" alt="image" src="https://github.com/user-attachments/assets/da5803f5-f4fb-4dd6-b4e3-2541f48ea576" />


### Features

- **Simple, addictive gameplay**: click/space to place the block, stack higher to score more
- **Difficulty indicator** and on‑screen score
- **Sound toggle**
- **Local and global leaderboard integration** (optional backend)

## Backend Code

https://github.com/taubyte/example-games-tower-blocks-backend

## Getting Started

1. Install dependencies

```bash
npm install
```

2. Run the dev server

```bash
npm run dev
```

> Requires Node 18+. See the `engines` field in `package.json`.

3. Open the app

The dev server will open automatically (default `http://localhost:3000`).

## Configuration

The app can call a backend for leaderboard endpoints. Base URL is optional:

- If `APP_API_BASE_URL` it will be used.
- If not set, the app falls back to `window.location.origin` (same‑origin).

Create `.env` (optional) and set:

```env
APP_API_BASE_URL=<URL>
```

See `src/utils/api.ts` for the fallback implementation.

## Scripts

- `npm run dev`: Start Vite dev server
- `npm run build`: Production build
- `npm run preview`: Preview the build locally

## Project Structure

```
example-games-tower-blocks-fork/
  index.html
  style.css
  assets/
    favicon.svg
  src/
    main.ts
    game.ts
    stage.ts
    block.ts
    audio.ts
    achievements.ts
    globalLeaderboard.ts
    services/
      leaderboard.ts
    utils/
      api.ts
      env.ts
      pool.ts
      version.ts
```

## Backend API

The frontend expects these endpoints (paths are fixed):

- GET `/api/leaderboard`

  - Returns a JSON array of `{ player_name: string, highest_score: string }`

- GET `/api/score?player_name=NAME`

  - Returns one player's score as JSON (or 404 if not found)

- POST `/api/score`
  - Body: full game state JSON used by the server to compute/store score, e.g.:

```json
{
  "player_name": "amine",
  "game_events": [
    {
      "event_type": "block_placed",
      "block_index": 3,
      "block_position": { "x": 0, "y": 3, "z": 0 },
      "block_scale": { "x": 3, "y": 1, "z": 3 },
      "target_position": { "x": 0, "y": 2, "z": 0 },
      "target_scale": { "x": 3, "y": 1, "z": 3 },
      "timestamp": 1200
    }
  ],
  "game_duration": 12345,
  "final_block_count": 12
}
```

If you use Taubyte or another serverless platform, store scores in a simple key/value database keyed by `player_name` (collection `/leaderboard`).

## Deployment

- Ensure CORS allows your frontend origin
- Rebuild after changing `APP_API_BASE_URL`/`VITE_API_BASE_URL`
- Serve the built `dist/` directory from any static host

## Troubleshooting

- Blank page or 404s to API: verify `APP_API_BASE_URL` or use same‑origin backend
- Mixed content errors: ensure the API is HTTPS when the site is served via HTTPS
- Dev server doesn’t open: visit `http://localhost:3000` manually
