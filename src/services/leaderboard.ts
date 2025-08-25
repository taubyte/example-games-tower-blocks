// Global leaderboard service with anti-cheat protection
export interface GlobalScore {
  player_name: string;
  highest_score: string;
  timestamp?: number; // Add timestamp for filtering
}

// Game state data for anti-cheat validation
export interface GameStateData {
  player_name: string;
  game_events: GameEvent[];
  game_duration: number; // in milliseconds
  final_block_count: number;
}

export interface GameEvent {
  event_type: "block_placed" | "block_chopped" | "perfect_placement" | "missed";
  block_index: number;
  block_position: { x: number; y: number; z: number };
  block_scale: { x: number; y: number; z: number };
  target_position: { x: number; y: number; z: number };
  target_scale: { x: number; y: number; z: number };
  timestamp: number; // relative to game start
}

// The API returns an array directly, not an object with scores property
export type LeaderboardResponse = GlobalScore[];

import { getApiBaseUrl } from "../utils/env";

class LeaderboardService {
  private readonly baseUrl = getApiBaseUrl();
  private readonly maxNameLength = 20; // Basic name validation

  // Get global leaderboard (top 10 all-time)
  async getGlobalLeaderboard(): Promise<GlobalScore[]> {
    try {
      const response = await fetch(`${this.baseUrl}/leaderboard`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data: LeaderboardResponse = await response.json();
      return data
        .sort((a, b) => parseInt(b.highest_score) - parseInt(a.highest_score))
        .slice(0, 10);
    } catch (error) {
      console.error("Failed to fetch global leaderboard:", error);
      return [];
    }
  }

  // Get score for specific player
  async getPlayerScore(playerName: string): Promise<GlobalScore | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/score?player_name=${encodeURIComponent(playerName)}`
      );
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error("Failed to fetch player score:", error);
      return null;
    }
  }

  // Submit full game state to /api/score; backend computes and stores score
  async submitScoreFromState(gameState: GameStateData): Promise<boolean> {
    if (!this.validateGameState(gameState)) return false;
    try {
      const response = await fetch(`${this.baseUrl}/score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(gameState),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return true;
    } catch (error) {
      console.error("Failed to submit score from state:", error);
      return false;
    }
  }

  // Basic validation for game state
  private validateGameState(gameState: GameStateData): boolean {
    if (
      !gameState.player_name ||
      gameState.player_name.trim().length === 0 ||
      gameState.player_name.length > this.maxNameLength
    )
      return false;
    if (gameState.game_duration < 1000 || gameState.game_duration > 3600000)
      return false;
    if (gameState.final_block_count < 1 || gameState.final_block_count > 1000)
      return false;
    if (
      !Array.isArray(gameState.game_events) ||
      gameState.game_events.length === 0
    )
      return false;
    return true;
  }
}

export const leaderboardService = new LeaderboardService();
