// Global leaderboard service with anti-cheat protection
export interface GlobalScore {
  player_name: string;
  highest_score: string;
}

// The API returns an array directly, not an object with scores property
export type LeaderboardResponse = GlobalScore[];

class LeaderboardService {
  private readonly baseUrl = "http://yzorlmue0.blackhole.localtau:14905/api";
  private readonly maxScoreThreshold = 10000; // Anti-cheat: reasonable max score
  private readonly minScoreThreshold = 0; // Anti-cheat: minimum valid score
  private readonly maxNameLength = 20; // Anti-cheat: reasonable name length

  // Get global leaderboard (top 10)
  async getGlobalLeaderboard(): Promise<GlobalScore[]> {
    try {
      console.log("Making API call to:", `${this.baseUrl}/leaderboard`);
      const response = await fetch(`${this.baseUrl}/leaderboard`);
      console.log("API response status:", response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: LeaderboardResponse = await response.json();
      console.log("API response data:", data);

      // Sort by score (highest first) and return top 10
      const sortedData = data
        .sort(
          (a: GlobalScore, b: GlobalScore) =>
            parseInt(b.highest_score) - parseInt(a.highest_score)
        )
        .slice(0, 10);

      console.log("Sorted and filtered data:", sortedData);
      return sortedData;
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
      if (!response.ok) {
        return null; // Player not found
      }
      return await response.json();
    } catch (error) {
      console.error("Failed to fetch player score:", error);
      return null;
    }
  }

  // Submit new score with anti-cheat validation
  async submitScore(playerName: string, score: number): Promise<boolean> {
    // Anti-cheat validation
    if (!this.validateScore(playerName, score)) {
      console.warn("Score submission rejected due to validation failure");
      return false;
    }

    try {
      const response = await fetch(`${this.baseUrl}/score`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          player_name: playerName,
          highest_score: score.toString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error("Failed to submit score:", error);
      return false;
    }
  }

  // Anti-cheat validation
  private validateScore(playerName: string, score: number): boolean {
    // Check score range
    if (score < this.minScoreThreshold || score > this.maxScoreThreshold) {
      console.warn(
        `Score ${score} is outside valid range [${this.minScoreThreshold}, ${this.maxScoreThreshold}]`
      );
      return false;
    }

    // Check player name
    if (
      !playerName ||
      playerName.trim().length === 0 ||
      playerName.length > this.maxNameLength
    ) {
      console.warn(`Invalid player name: "${playerName}"`);
      return false;
    }

    // Check for suspicious patterns (very high scores)
    if (score > 5000) {
      // Additional validation for very high scores
      // In a real implementation, you might check game duration, moves made, etc.
      console.warn(`Very high score detected: ${score}`);
      // For now, we'll allow it but log it
    }

    return true;
  }
}

export const leaderboardService = new LeaderboardService();
