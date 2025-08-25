# Tower Blocks (Refactored)   

## Quick Start

1. Install dependencies:

```
npm install
```

2. Configure environment:
   - Create a `.env` file at project root and set :

```
APP_API_BASE_URL=http://yzorlmue0.blackhole.localtau:14005/api
```

- For local use, point to your local API, e.g. `http://localhost:14005/api`.
  Backward compatible: `VITE_API_BASE_URL` also works if already used.

3. Run the dev server:

```
npm run dev
```

## Required Backend Endpoints

The frontend expects the following endpoints (paths are fixed):

- GET `/api/leaderboard`

  - Returns JSON array of: `{ player_name: string, highest_score: string }`.

- GET `/api/score?player_name=NAME`

  - Returns one player's score as JSON or 404 when not found.

- POST `/api/score`

  - Body: full game state JSON:

```
{
  "player_name": "amine",
  "game_events": [
    {
      "event_type": "block_placed" | "block_chopped" | "perfect_placement" | "missed",
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

- Server computes the score from the JSON and stores it in `/leaderboard`.

## Database (suggested if using Taubyte)

- Create one database (no predefined fields/schemas):
  - `/leaderboard`

Implementation details are handled by the serverless function; it uses `player_name` as the key and stores the computed score as the value. No fields need to be defined on creation.

## Environment Variables

- `APP_API_BASE_URL` (preferred) or `VITE_API_BASE_URL`: Base URL for the backend API (no trailing slash). Example: `http://localhost:14005/api`.

## Deployment Notes

- Ensure CORS allows your frontend origin.
- Rebuild after changing `APP_API_BASE_URL` or `VITE_API_BASE_URL`.
- Keep endpoints and JSON shapes exactly as above for compatibility.

## Serverless Functions

The backend/serverless code referenced by this README lives in the `serverless-functions` branch of this repository. Switch to that branch to view and deploy the HTTP handlers for `/api/leaderboard` and `/api/score`.
