// Global leaderboard component for game scene
import { leaderboardService, GlobalScore } from "./services/leaderboard";

export class GlobalLeaderboard {
  private container!: HTMLElement;
  private isVisible: boolean = false;
  private scores: GlobalScore[] = [];
  private refreshInterval: number | null = null;

  constructor() {
    this.createLeaderboardElement();
    this.startAutoRefresh();
  }

  private createLeaderboardElement(): void {
    // Create the leaderboard container
    this.container = document.createElement("div");
    this.container.id = "global-leaderboard";
    this.container.className = "global-leaderboard";

    // Add to the game container
    const gameContainer = document.getElementById("container");
    if (gameContainer) {
      gameContainer.appendChild(this.container);
      console.log("Global leaderboard element created and added to DOM");
    } else {
      console.error("Game container not found!");
    }
  }

  public async show(): Promise<void> {
    console.log("Showing global leaderboard...");
    this.isVisible = true;
    this.container.style.display = "block";
    console.log("Leaderboard container display:", this.container.style.display);
    await this.refreshScores();
  }

  public hide(): void {
    this.isVisible = false;
    this.container.style.display = "none";
  }

  public async refreshScores(): Promise<void> {
    try {
      console.log("Fetching global leaderboard...");
      this.scores = await leaderboardService.getGlobalLeaderboard();
      console.log("Global leaderboard scores:", this.scores);
      this.renderScores();
    } catch (error) {
      console.error("Failed to refresh global leaderboard:", error);
    }
  }

  private renderScores(): void {
    console.log(
      "Rendering scores, isVisible:",
      this.isVisible,
      "scores count:",
      this.scores.length
    );
    if (!this.isVisible) return;

    // Add some test data if no scores are available (for debugging)
    const scoresToShow =
      this.scores.length === 0
        ? [
            { player_name: "Test Player 1", highest_score: "100" },
            { player_name: "Test Player 2", highest_score: "85" },
            { player_name: "Test Player 3", highest_score: "72" },
          ]
        : this.scores;

    this.container.innerHTML = `
      <div class="leaderboard-header">
        <h3>🌍 Global Leaderboard</h3>
        <div class="leaderboard-subtitle">Top 10 Players (Last 5 Min)</div>
      </div>
      <div class="leaderboard-content">
        ${
          scoresToShow.length === 0
            ? '<div class="no-scores">No scores yet</div>'
            : scoresToShow
                .map(
                  (score, index) => `
              <div class="leaderboard-item ${index < 3 ? "top-three" : ""}">
                <div class="rank">${this.getRankIcon(index + 1)}</div>
                <div class="player-name">${this.escapeHtml(
                  score.player_name
                )}</div>
                <div class="score">${score.highest_score}</div>
              </div>
            `
                )
                .join("")
        }
      </div>
    `;

    console.log("Leaderboard HTML rendered");
  }

  private getRankIcon(rank: number): string {
    switch (rank) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return `${rank}`;
    }
  }

  private escapeHtml(text: string): string {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  private startAutoRefresh(): void {
    // Refresh leaderboard every 30 seconds
    this.refreshInterval = window.setInterval(() => {
      if (this.isVisible) {
        this.refreshScores();
      }
    }, 30000);
  }

  public destroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    if (this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }

  // Method to submit a new score
  public async submitScore(
    playerName: string,
    score: number
  ): Promise<boolean> {
    const success = await leaderboardService.submitScore(playerName, score);
    if (success) {
      // Refresh the leaderboard after successful submission
      await this.refreshScores();
    }
    return success;
  }
}
