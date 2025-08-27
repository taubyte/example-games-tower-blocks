// Achievement system for player milestones
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  condition: (stats: GameStats) => boolean;
}

export interface GameStats {
  totalBlocks: number;
  perfectPlaces: number;
  highestScore: number;
  gamesPlayed: number;
  totalPlayTime: number;
  consecutivePerfect: number;
}

export class AchievementSystem {
  private achievements: Achievement[] = [];
  private stats: GameStats;
  private container!: HTMLElement;

  constructor() {
    this.stats = this.loadStats();
    this.createAchievementContainer();
    this.initializeAchievements();
  }

  private createAchievementContainer(): void {
    this.container = document.createElement("div");
    this.container.id = "achievement-container";
    this.container.className = "achievement-container";

    const gameContainer = document.getElementById("container");
    if (gameContainer) {
      gameContainer.appendChild(this.container);
    }
  }

  private initializeAchievements(): void {
    this.achievements = [
      {
        id: "first_block",
        title: "First Steps",
        description: "Place your first block",
        icon: "🎯",
        unlocked: false,
        condition: (stats) => stats.totalBlocks >= 1,
      },
      {
        id: "tower_10",
        title: "Tower Builder",
        description: "Build a tower of 10 blocks",
        icon: "🏗️",
        unlocked: false,
        condition: (stats) => stats.highestScore >= 10,
      },
      {
        id: "tower_50",
        title: "Skyscraper",
        description: "Build a tower of 50 blocks",
        icon: "🏢",
        unlocked: false,
        condition: (stats) => stats.highestScore >= 50,
      },
      {
        id: "perfect_10",
        title: "Precision Master",
        description: "Get 10 perfect placements",
        icon: "🎯",
        unlocked: false,
        condition: (stats) => stats.perfectPlaces >= 10,
      },
      {
        id: "perfect_50",
        title: "Perfect Storm",
        description: "Get 50 perfect placements",
        icon: "⭐",
        unlocked: false,
        condition: (stats) => stats.perfectPlaces >= 50,
      },
      {
        id: "consecutive_5",
        title: "Hot Streak",
        description: "Get 5 consecutive perfect placements",
        icon: "🔥",
        unlocked: false,
        condition: (stats) => stats.consecutivePerfect >= 5,
      },
      {
        id: "games_10",
        title: "Dedicated Player",
        description: "Play 10 games",
        icon: "🎮",
        unlocked: false,
        condition: (stats) => stats.gamesPlayed >= 10,
      },
      {
        id: "tower_100",
        title: "Master Builder",
        description: "Build a tower of 100 blocks",
        icon: "🏛️",
        unlocked: false,
        condition: (stats) => stats.highestScore >= 100,
      },
    ];

    this.loadUnlockedAchievements();
  }

  // Update stats and check for new achievements
  public updateStats(newStats: Partial<GameStats>): void {
    this.stats = { ...this.stats, ...newStats };
    this.saveStats();
    this.checkAchievements();
  }

  // Check if any new achievements should be unlocked
  private checkAchievements(): void {
    let newAchievements: Achievement[] = [];

    this.achievements.forEach((achievement) => {
      if (!achievement.unlocked && achievement.condition(this.stats)) {
        achievement.unlocked = true;
        newAchievements.push(achievement);
      }
    });

    if (newAchievements.length > 0) {
      this.saveUnlockedAchievements();
      this.showAchievementNotification(newAchievements);
    }
  }

  // Show achievement notification
  private showAchievementNotification(achievements: Achievement[]): void {
    achievements.forEach((achievement) => {
      const notification = document.createElement("div");
      notification.className = "achievement-notification";
      notification.innerHTML = `
        <div class="achievement-icon">${achievement.icon}</div>
        <div class="achievement-content">
          <div class="achievement-title">${achievement.title}</div>
          <div class="achievement-description">${achievement.description}</div>
        </div>
      `;

      this.container.appendChild(notification);

      // Animate in
      setTimeout(() => {
        notification.classList.add("show");
      }, 100);

      // Remove after 3 seconds
      setTimeout(() => {
        notification.classList.remove("show");
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 300);
      }, 3000);
    });
  }

  // Get all achievements
  public getAchievements(): Achievement[] {
    return this.achievements;
  }

  // Get unlocked achievements
  public getUnlockedAchievements(): Achievement[] {
    return this.achievements.filter((a) => a.unlocked);
  }

  // Get achievement progress
  public getAchievementProgress(achievementId: string): number {
    const achievement = this.achievements.find((a) => a.id === achievementId);
    if (!achievement) return 0;

    // Calculate progress based on condition
    switch (achievementId) {
      case "first_block":
        return Math.min(this.stats.totalBlocks, 1);
      case "tower_10":
        return Math.min(this.stats.highestScore / 10, 1);
      case "tower_50":
        return Math.min(this.stats.highestScore / 50, 1);
      case "perfect_10":
        return Math.min(this.stats.perfectPlaces / 10, 1);
      case "perfect_50":
        return Math.min(this.stats.perfectPlaces / 50, 1);
      case "consecutive_5":
        return Math.min(this.stats.consecutivePerfect / 5, 1);
      case "games_10":
        return Math.min(this.stats.gamesPlayed / 10, 1);
      case "tower_100":
        return Math.min(this.stats.highestScore / 100, 1);
      default:
        return 0;
    }
  }

  private loadStats(): GameStats {
    const saved = localStorage.getItem("towerBlocksStats");
    return saved
      ? JSON.parse(saved)
      : {
          totalBlocks: 0,
          perfectPlaces: 0,
          highestScore: 0,
          gamesPlayed: 0,
          totalPlayTime: 0,
          consecutivePerfect: 0,
        };
  }

  private saveStats(): void {
    localStorage.setItem("towerBlocksStats", JSON.stringify(this.stats));
  }

  private loadUnlockedAchievements(): void {
    const saved = localStorage.getItem("towerBlocksAchievements");
    if (saved) {
      const unlockedIds = JSON.parse(saved);
      this.achievements.forEach((achievement) => {
        achievement.unlocked = unlockedIds.includes(achievement.id);
      });
    }
  }

  private saveUnlockedAchievements(): void {
    const unlockedIds = this.achievements
      .filter((a) => a.unlocked)
      .map((a) => a.id);
    localStorage.setItem(
      "towerBlocksAchievements",
      JSON.stringify(unlockedIds)
    );
  }
}

export const achievementSystem = new AchievementSystem();
