import { Easing, Tween, update as tweenjsUpdate } from "@tweenjs/tween.js";

import { Vector3 } from "three";
import { Block } from "./block";
import { Stage } from "./stage";
import { Ticker } from "./ticker";
import { Env, getEnv } from "./utils/env";
import { getVersion } from "./utils/version";
import { Pool } from "./utils/pool";
import config from "./config.json";
import { audioManager } from "./audio";
import { particleSystem } from "./particles";
import { achievementSystem } from "./achievements";
import { GameEvent, GameStateData } from "./services/leaderboard";

type GameState = "loading" | "ready" | "playing" | "ended" | "resetting";

export class Game {
  private mainContainer!: HTMLElement;
  private scoreContainer!: HTMLElement;
  private versionContainer!: HTMLElement;
  private instructions!: HTMLElement;

  private ticker!: Ticker;

  private state: GameState = "loading";
  private stage!: Stage;
  private blocks!: Block[];

  private pool!: Pool<Block>;

  private colorOffset!: number;

  // Add callback for game over
  private onGameOver:
    | ((score: number, gameState?: GameStateData) => void)
    | null = null;

  // Game statistics for achievements
  private gameStats = {
    totalBlocks: 0,
    perfectPlaces: 0,
    consecutivePerfect: 0,
    gameStartTime: 0,
  };

  // Game events for anti-cheat validation
  private gameEvents: GameEvent[] = [];

  public prepare(
    width: number,
    height: number,
    devicePixelRatio: number
  ): void {
    this.mainContainer = document.getElementById("container")!;
    this.scoreContainer = document.getElementById("score")!;
    this.versionContainer = document.getElementById("version")!;
    this.instructions = document.getElementById("instructions")!;

    this.scoreContainer.innerHTML = "0";
    this.versionContainer.innerHTML = `v${getVersion()}`;

    this.stage = new Stage(devicePixelRatio);
    this.stage.resize(width, height);

    this.blocks = [];
    this.addBaseBlock();

    this.pool = new Pool(() => new Block());

    this.ticker = new Ticker((currentTime: number, deltaTime: number) => {
      tweenjsUpdate(currentTime);

      this.update(deltaTime);
      this.render();
    });

    this.updateState("ready");
  }

  public start(): void {
    this.ticker.start();
    // Start the game immediately when called from modal
    this.startGame();
  }

  public pause(): void {
    this.ticker.stop();
  }

  public resize(width: number, height: number): void {
    this.stage.resize(width, height);
  }

  // Add method to check if game is playing
  public isPlaying(): boolean {
    return this.state === "playing";
  }

  // Add method to restart the game
  public restart(): void {
    this.restartGame();
  }

  // Add method to set game over callback
  public setGameOverCallback(callback: (score: number) => void): void {
    this.onGameOver = callback;
  }

  private update(deltaTime: number): void {
    this.moveCurrentBlock(deltaTime);

    // Update particle system
    particleSystem.update(deltaTime);
  }

  private render(): void {
    this.stage.render();
  }

  private updateState(newState: GameState): void {
    this.mainContainer.classList.remove(this.state);
    this.state = newState;
    this.mainContainer.classList.add(this.state);
  }

  public action(): void {
    switch (this.state) {
      case "ready":
        this.startGame();
        break;
      case "playing":
        this.placeBlock();
        break;
      case "ended":
        this.restartGame();
        break;
    }
  }

  private startGame(): void {
    if (this.state === "playing") return;
    this.colorOffset = Math.round(Math.random() * 100);
    this.scoreContainer.innerHTML = "0";
    this.updateState("playing");
    this.addBlock(this.blocks[0]);

    // Reset game stats and start tracking
    this.gameStats = {
      totalBlocks: 0,
      perfectPlaces: 0,
      consecutivePerfect: 0,
      gameStartTime: Date.now(),
    };

    // Reset game events
    this.gameEvents = [];

    // Play game start sound
    audioManager.playSound("gameStart");

    // Start background music
    audioManager.startBackgroundMusic();

    // Update difficulty indicator
    this.updateDifficultyIndicator();
  }

  private restartGame(): void {
    this.updateState("resetting");

    const length = this.blocks.length;
    const duration = 200;
    const delay = 20;

    for (let i = length - 1; i > 0; i--) {
      new Tween(this.blocks[i].scale)
        .to({ x: 0, y: 0, z: 0 }, duration)
        .delay((length - i - 1) * delay)
        .easing(Easing.Cubic.In)
        .onComplete(() => {
          this.stage.remove(this.blocks[i].getMesh());
          this.pool.release(this.blocks[i]);
        })
        .start();

      new Tween(this.blocks[i].rotation)
        .to({ y: 0.5 }, duration)
        .delay((length - i - 1) * delay)
        .easing(Easing.Cubic.In)
        .start();
    }

    const cameraMoveSpeed = duration * 2 + length * delay;
    this.stage.resetCamera(cameraMoveSpeed);

    const countdown = { value: length - 1 - 1 };
    new Tween(countdown)
      .to({ value: 0 }, cameraMoveSpeed)
      .onUpdate(() => {
        this.scoreContainer.innerHTML = String(Math.floor(countdown.value));
      })
      .start();

    setTimeout(() => {
      this.blocks = this.blocks.slice(0, 1);
      this.startGame();
    }, cameraMoveSpeed);
  }

  private endGame(): void {
    this.updateState("ended");

    // Get the final score (number of blocks - 1 for the base block)
    const finalScore = this.blocks.length - 1;

    // Play game over sound
    audioManager.playSound("gameOver");

    // Stop background music
    audioManager.stopBackgroundMusic();

    // Update achievements
    const gameTime = Date.now() - this.gameStats.gameStartTime;
    achievementSystem.updateStats({
      totalBlocks: this.gameStats.totalBlocks,
      perfectPlaces: this.gameStats.perfectPlaces,
      highestScore: Math.max(
        finalScore,
        achievementSystem.getAchievements().find((a) => a.id === "tower_10")
          ?.unlocked
          ? 0
          : 0
      ),
      gamesPlayed: 1, // Increment games played
      totalPlayTime: gameTime,
      consecutivePerfect: this.gameStats.consecutivePerfect,
    });

    // Create game state data for anti-cheat validation
    const gameState: GameStateData = {
      player_name: "", // Will be set by the callback
      game_events: this.gameEvents,
      game_duration: Date.now() - this.gameStats.gameStartTime,
      final_block_count: this.blocks.length,
    };

    // Call the game over callback if set
    if (this.onGameOver) {
      this.onGameOver(finalScore, gameState);
    }
  }

  private placeBlock(): void {
    const length = this.blocks.length;
    const targetBlock = this.blocks[length - 2];
    const currentBlock = this.blocks[length - 1];

    const result = currentBlock.cut(targetBlock, config.gameplay.accuracy);

    // Track game event
    const eventTime = Date.now() - this.gameStats.gameStartTime;
    const gameEvent: GameEvent = {
      event_type:
        result.state === "missed"
          ? "missed"
          : result.state === "perfect"
          ? "perfect_placement"
          : "block_chopped",
      block_index: this.blocks.length - 1,
      block_position: {
        x: currentBlock.x,
        y: currentBlock.y,
        z: currentBlock.z,
      },
      block_scale: {
        x: currentBlock.scale.x,
        y: currentBlock.scale.y,
        z: currentBlock.scale.z,
      },
      target_position: {
        x: targetBlock.x,
        y: targetBlock.y,
        z: targetBlock.z,
      },
      target_scale: {
        x: targetBlock.scale.x,
        y: targetBlock.scale.y,
        z: targetBlock.scale.z,
      },
      timestamp: eventTime,
    };
    this.gameEvents.push(gameEvent);

    if (result.state === "missed") {
      this.stage.remove(currentBlock.getMesh());
      audioManager.playSound("blockMiss");
      this.endGame();
      return;
    }

    // Update game stats
    this.gameStats.totalBlocks++;

    // Handle perfect placement
    if (result.state === "perfect") {
      this.gameStats.perfectPlaces++;
      this.gameStats.consecutivePerfect++;
      audioManager.playSound("perfect");

      // Create sparkle effect for perfect placement
      particleSystem.createSparkle(currentBlock.position, currentBlock.color);

      // Show perfect score popup
      this.showScorePopup("Perfect!", "#FFD700");
    } else {
      this.gameStats.consecutivePerfect = 0;
      audioManager.playSound("blockPlace");

      // Create explosion effect for regular placement
      particleSystem.createExplosion(
        currentBlock.position,
        currentBlock.color,
        4
      );
    }

    this.scoreContainer.innerHTML = String(length - 1);
    this.addBlock(currentBlock);

    if (result.state === "chopped" && result.position && result.scale) {
      this.addChoppedBlock(result.position, result.scale, currentBlock);
    }

    // Update difficulty indicator
    this.updateDifficultyIndicator();
  }

  private addBaseBlock(): void {
    const { scale, color } = config.block.base;
    const block = new Block(new Vector3(scale.x, scale.y, scale.z));
    this.stage.add(block.getMesh());
    this.blocks.push(block);
    block.color = parseInt(color, 16);
  }

  private addBlock(targetBlock: Block): void {
    const block = this.pool.get();

    block.rotation.set(0, 0, 0);
    block.scale.set(
      targetBlock.scale.x,
      targetBlock.scale.y,
      targetBlock.scale.z
    );
    block.position.set(
      targetBlock.x,
      targetBlock.y + targetBlock.height,
      targetBlock.z
    );
    block.direction.set(0, 0, 0);
    block.color = this.getNextBlockColor();

    this.stage.add(block.getMesh());
    this.blocks.push(block);

    const length = this.blocks.length;
    if (length % 2 === 0) {
      block.direction.x = Math.random() > 0.5 ? 1 : -1;
    } else {
      block.direction.z = Math.random() > 0.5 ? 1 : -1;
    }

    block.moveScalar(config.gameplay.distance);
    this.stage.setCamera(block.y);

    this.scoreContainer.innerHTML = String(length - 1);
    if (length >= config.instructions.height) {
      this.instructions.classList.add("hide");
    }
  }

  private addChoppedBlock(
    position: Vector3,
    scale: Vector3,
    sourceBlock: Block
  ): void {
    const block = this.pool.get();

    block.rotation.set(0, 0, 0);
    block.scale.set(scale.x, scale.y, scale.z);
    block.position.copy(position);
    block.color = sourceBlock.color;

    this.stage.add(block.getMesh());

    const dirX = Math.sign(block.x - sourceBlock.x);
    const dirZ = Math.sign(block.z - sourceBlock.z);
    new Tween(block.position)
      .to(
        {
          x: block.x + dirX * 10,
          y: block.y - 30,
          z: block.z + dirZ * 10,
        },
        1000
      )
      .easing(Easing.Quadratic.In)
      .onComplete(() => {
        this.stage.remove(block.getMesh());
        this.pool.release(block);
      })
      .start();

    new Tween(block.rotation)
      .to({ x: dirZ * 5, z: dirX * -5 }, 900)
      .delay(50)
      .start();
  }

  private moveCurrentBlock(deltaTime: number): void {
    if (this.state !== "playing") return;

    const length = this.blocks.length;
    if (length < 2) return;

    const speed = 0.16 + Math.min(0.0008 * length, 0.08);
    this.blocks[length - 1].moveScalar(speed * deltaTime);

    this.reverseDirection();
  }

  private reverseDirection(): void {
    const length = this.blocks.length;
    if (length < 2) return;

    const targetBlock = this.blocks[length - 2];
    const currentBlock = this.blocks[length - 1];

    const { distance } = config.gameplay;

    const diffX = currentBlock.x - targetBlock.x;
    if (
      (currentBlock.direction.x === 1 && diffX > distance) ||
      (currentBlock.direction.x === -1 && diffX < -distance)
    ) {
      currentBlock.direction.x *= -1;
      return;
    }

    const diffZ = currentBlock.z - targetBlock.z;
    if (
      (currentBlock.direction.z === 1 && diffZ > distance) ||
      (currentBlock.direction.z === -1 && diffZ < -distance)
    ) {
      currentBlock.direction.z *= -1;
      return;
    }
  }

  private getNextBlockColor(): number {
    const { base, range, intesity } = config.block.colors;
    const offset = this.blocks.length + this.colorOffset;
    const r = base.r + range.r * Math.sin(intesity.r * offset);
    const g = base.g + range.g * Math.sin(intesity.g * offset);
    const b = base.b + range.b * Math.sin(intesity.b * offset);
    return (r << 16) + (g << 8) + b;
  }

  // Show score popup animation
  private showScorePopup(text: string, color: string): void {
    const popup = document.createElement("div");
    popup.className = "score-multiplier";
    popup.textContent = text;
    popup.style.color = color;

    document.body.appendChild(popup);

    // Remove after animation
    setTimeout(() => {
      if (popup.parentNode) {
        popup.parentNode.removeChild(popup);
      }
    }, 500);
  }

  // Update difficulty indicator based on current score
  private updateDifficultyIndicator(): void {
    const score = this.blocks.length - 1;
    const indicator = document.getElementById("difficulty-indicator");

    if (!indicator) return;

    if (score < 10) {
      indicator.textContent = "Easy";
      indicator.className = "difficulty-indicator difficulty-easy";
    } else if (score < 30) {
      indicator.textContent = "Medium";
      indicator.className = "difficulty-indicator difficulty-medium";
    } else {
      indicator.textContent = "Hard";
      indicator.className = "difficulty-indicator difficulty-hard";
    }
  }
}
