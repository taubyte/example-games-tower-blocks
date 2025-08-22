import { Game } from "./game";
import { ModalManager } from "./modal";
import { GlobalLeaderboard } from "./globalLeaderboard";
import { audioManager } from "./audio";
import { particleSystem } from "./particles";
import { achievementSystem } from "./achievements";

// Initialize modal manager, game, and global leaderboard
const modalManager = new ModalManager();
const game = new Game();
const globalLeaderboard = new GlobalLeaderboard();

function onResize(): void {
  game.resize(window.innerWidth, window.innerHeight);
}

function onTouchStart(event: TouchEvent): void {
  event.preventDefault();
  // Only allow game actions when playing
  if (game.isPlaying()) {
    game.action();
  }
}

function onMouseDown(event: MouseEvent): void {
  event.preventDefault();
  // Only allow game actions when playing
  if (game.isPlaying()) {
    game.action();
  }
}

function onKeyDown(event: KeyboardEvent): void {
  if (event.code === "Space") {
    // Only allow game actions when playing
    if (game.isPlaying()) {
      game.action();
    }
  }
}

function onLoad(): void {
  // Prepare the game but don't start it yet
  game.prepare(window.innerWidth, window.innerHeight, window.devicePixelRatio);

  // Set up modal callbacks
  modalManager.setStartGameCallback(() => {
    // Start the game when start button is pressed
    game.start();
    // Show global leaderboard when game starts
    globalLeaderboard.show();
  });

  modalManager.setPlayAgainCallback(() => {
    // Restart the game when play again is pressed
    game.restart();
    // Show global leaderboard when game restarts
    globalLeaderboard.show();
  });

  // Set up game over callback
  game.setGameOverCallback(async (score: number) => {
    // Show game over modal with final score
    modalManager.showGameOver(score);

    // Submit score to global leaderboard
    const playerName = modalManager.getCurrentPlayerName();
    if (playerName) {
      await globalLeaderboard.submitScore(playerName, score);
    }
  });

  // Set up game event listeners
  window.addEventListener("resize", onResize, false);
  window.addEventListener("orientationchange", onResize, false);
  window.addEventListener("touchstart", onTouchStart, { passive: false });
  window.addEventListener("mousedown", onMouseDown, false);
  window.addEventListener("keydown", onKeyDown, false);

  // Initialize global leaderboard (hidden until game starts)

  // Set up audio controls
  const audioToggle = document.getElementById(
    "audio-toggle"
  ) as HTMLButtonElement;
  if (audioToggle) {
    audioToggle.addEventListener("click", () => {
      audioManager.toggleMute();
      audioToggle.textContent = audioManager.getMuted() ? "🔇" : "🔊";
      audioToggle.classList.toggle("muted", audioManager.getMuted());

      // If unmuting and game is playing, restart background music
      if (!audioManager.getMuted() && game.isPlaying()) {
        audioManager.startBackgroundMusic();
      }
    });
  }
}

window.addEventListener("load", onLoad, false);
