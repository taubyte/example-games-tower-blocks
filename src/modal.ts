// Modal management and score tracking module
export interface GameScore {
  playerName: string;
  score: number;
  date: string;
}

export class ModalManager {
  private modal: HTMLElement;
  private nameInputSection: HTMLElement;
  private startGameSection: HTMLElement;
  private gameOverSection: HTMLElement;
  private playerNameInput: HTMLInputElement;
  private playerDisplayName: HTMLElement;
  private finalScore: HTMLElement;
  private personalBestBanner!: HTMLElement;
  private scoresList!: HTMLElement;
  private scoresListGameOver!: HTMLElement;

  private currentPlayerName: string = "";
  private onStartGame: (() => void) | null = null;
  private onPlayAgain: (() => void) | null = null;

  constructor() {
    // Initialize modal elements
    this.modal = document.getElementById("game-modal") as HTMLElement;
    this.nameInputSection = document.getElementById(
      "name-input-section"
    ) as HTMLElement;
    this.startGameSection = document.getElementById(
      "start-game-section"
    ) as HTMLElement;
    this.gameOverSection = document.getElementById(
      "game-over-section"
    ) as HTMLElement;
    this.playerNameInput = document.getElementById(
      "player-name"
    ) as HTMLInputElement;
    this.playerDisplayName = document.getElementById(
      "player-display-name"
    ) as HTMLElement;
    this.finalScore = document.getElementById("final-score") as HTMLElement;
    // Create PB banner (hidden by default)
    this.personalBestBanner = document.createElement("div");
    this.personalBestBanner.id = "personal-best-banner";
    this.personalBestBanner.className = "personal-best-banner hidden";
    this.personalBestBanner.textContent = "New Personal Best!";
    const gameOverSection = document.getElementById("game-over-section");
    if (gameOverSection) {
      gameOverSection.insertBefore(
        this.personalBestBanner,
        gameOverSection.firstChild
      );
    }
    this.scoresList = document.getElementById("scores-list") as HTMLElement;
    this.scoresListGameOver = document.getElementById(
      "scores-list-game-over"
    ) as HTMLElement;

    // Ensure input is cleared and unlocked on load to avoid stale autofill
    this.playerNameInput.value = "";
    this.playerNameInput.autocomplete = "off";
    this.playerNameInput.spellcheck = false;
    this.playerNameInput.readOnly = false;
    this.playerNameInput.disabled = false;

    // Set up event listeners
    this.setupEventListeners();

    // Show the modal initially with name input
    this.showNameInput();
  }

  private setupEventListeners(): void {
    // Name submit button
    const nameSubmitBtn = document.getElementById(
      "name-submit-btn"
    ) as HTMLButtonElement;
    nameSubmitBtn.addEventListener("click", () => this.handleNameSubmit());

    // Start game button
    const startButton = document.getElementById(
      "start-button"
    ) as HTMLButtonElement;
    startButton.addEventListener("click", () => this.handleStartGame());

    // Play again button
    const playAgainBtn = document.getElementById(
      "play-again-btn"
    ) as HTMLButtonElement;
    playAgainBtn.addEventListener("click", () => this.handlePlayAgain());

    // Enter key on name input
    this.playerNameInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.handleNameSubmit();
      }
    });
  }

  private handleNameSubmit(): void {
    const playerName = this.playerNameInput.value.trim();
    if (playerName.length === 0) {
      alert("Please enter your name");
      return;
    }

    this.currentPlayerName = playerName;
    this.playerDisplayName.textContent = playerName;
    // Persist for other components (e.g., leaderboard highlight)
    try {
      localStorage.setItem("towerBlocksPlayerName", playerName);
    } catch {}
    this.showStartGame();
  }

  private handleStartGame(): void {
    if (this.onStartGame) {
      this.hideModal();
      this.onStartGame();
    }
  }

  private handlePlayAgain(): void {
    if (this.onPlayAgain) {
      // Hide the modal before restarting the game
      this.hideModal();
      this.onPlayAgain();
    }
  }

  private showNameInput(): void {
    this.nameInputSection.classList.remove("hidden");
    this.startGameSection.classList.add("hidden");
    this.gameOverSection.classList.add("hidden");
    this.modal.style.display = "flex";

    // Reset current name and clear/unlock the input each time the modal opens
    this.currentPlayerName = "";
    this.playerNameInput.value = "";
    this.playerNameInput.readOnly = false;
    this.playerNameInput.disabled = false;
    this.playerNameInput.autocomplete = "off";
    this.playerNameInput.spellcheck = false;

    this.playerNameInput.focus();
    // Hide global leaderboard when modal appears
    this.hideGlobalLeaderboard();
  }

  private showStartGame(): void {
    this.nameInputSection.classList.add("hidden");
    this.startGameSection.classList.remove("hidden");
    this.gameOverSection.classList.add("hidden");
    this.updateScoresList();
    // Hide global leaderboard when modal appears
    this.hideGlobalLeaderboard();
  }

  public showGameOver(finalScore: number): void {
    this.finalScore.textContent = finalScore.toString();
    this.nameInputSection.classList.add("hidden");
    this.startGameSection.classList.add("hidden");
    this.gameOverSection.classList.remove("hidden");
    this.modal.style.display = "flex";

    // Save the score
    this.saveScore(finalScore);

    // Show PB banner if this is the highest local score
    const scores = this.getScores();
    const maxLocal = scores.reduce((m, s) => Math.max(m, s.score), 0);
    const isPB = finalScore >= maxLocal;
    if (this.personalBestBanner) {
      this.personalBestBanner.classList.toggle("hidden", !isPB);
    }

    // Update both score lists to show the latest scores
    this.updateScoresList();
    this.updateGameOverScoresList();

    // Hide global leaderboard when modal appears
    this.hideGlobalLeaderboard();
  }

  private hideModal(): void {
    this.modal.style.display = "none";
  }

  public setStartGameCallback(callback: () => void): void {
    this.onStartGame = callback;
  }

  public setPlayAgainCallback(callback: () => void): void {
    this.onPlayAgain = callback;
  }

  // Get current player name
  public getCurrentPlayerName(): string {
    return this.currentPlayerName;
  }

  // Hide global leaderboard when modal is shown
  private hideGlobalLeaderboard(): void {
    const globalLeaderboard = document.getElementById("global-leaderboard");
    if (globalLeaderboard) {
      globalLeaderboard.style.display = "none";
    }
  }

  private saveScore(score: number): void {
    const gameScore: GameScore = {
      playerName: this.currentPlayerName,
      score: score,
      date: new Date().toLocaleDateString(),
    };

    // Get existing scores from localStorage
    const existingScores = this.getScores();

    // Add new score
    existingScores.push(gameScore);

    // Sort by score (highest first) and keep only top 5
    existingScores.sort((a, b) => b.score - a.score);
    const topScores = existingScores.slice(0, 5);

    // Save back to localStorage
    localStorage.setItem("towerBlocksScores", JSON.stringify(topScores));
  }

  private getScores(): GameScore[] {
    const scoresJson = localStorage.getItem("towerBlocksScores");
    return scoresJson ? JSON.parse(scoresJson) : [];
  }

  private updateScoresList(): void {
    const scores = this.getScores();

    if (scores.length === 0) {
      this.scoresList.innerHTML =
        '<p class="no-scores">No previous scores yet</p>';
      return;
    }

    this.scoresList.innerHTML = scores
      .map(
        (score, index) => `
        <div class="score-item">
          <span>${index + 1}. ${score.playerName}</span>
          <span>${score.score} (${score.date})</span>
        </div>
      `
      )
      .join("");
  }

  private updateGameOverScoresList(): void {
    const scores = this.getScores();

    if (scores.length === 0) {
      this.scoresListGameOver.innerHTML =
        '<p class="no-scores">No previous scores yet</p>';
      return;
    }

    this.scoresListGameOver.innerHTML = scores
      .map(
        (score, index) => `
        <div class="score-item">
          <span>${index + 1}. ${score.playerName}</span>
          <span>${score.score} (${score.date})</span>
        </div>
      `
      )
      .join("");
  }
}
