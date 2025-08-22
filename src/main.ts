import { Game } from "./game";
import { ModalManager } from "./modal";

// Initialize modal manager and game
const modalManager = new ModalManager();
const game = new Game();

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
  });

  modalManager.setPlayAgainCallback(() => {
    // Restart the game when play again is pressed
    game.restart();
  });

  // Set up game over callback
  game.setGameOverCallback((score: number) => {
    // Show game over modal with final score
    modalManager.showGameOver(score);
  });

  // Set up game event listeners
  window.addEventListener("resize", onResize, false);
  window.addEventListener("orientationchange", onResize, false);
  window.addEventListener("touchstart", onTouchStart, { passive: false });
  window.addEventListener("mousedown", onMouseDown, false);
  window.addEventListener("keydown", onKeyDown, false);
}

window.addEventListener("load", onLoad, false);
