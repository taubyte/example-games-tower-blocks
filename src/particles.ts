// Particle effects system for visual feedback
import { Vector3 } from "three";

export interface Particle {
  position: Vector3;
  velocity: Vector3;
  life: number;
  maxLife: number;
  color: number;
  size: number;
}

export class ParticleSystem {
  private particles: Particle[] = [];
  private container!: HTMLElement;

  constructor() {
    this.createParticleContainer();
  }

  private createParticleContainer(): void {
    this.container = document.createElement("div");
    this.container.id = "particle-container";
    this.container.className = "particle-container";

    const gameContainer = document.getElementById("container");
    if (gameContainer) {
      gameContainer.appendChild(this.container);
    }
  }

  // Create explosion effect at position
  public createExplosion(
    position: Vector3,
    color: number,
    count: number = 8
  ): void {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = 2 + Math.random() * 3;

      const particle: Particle = {
        position: position.clone(),
        velocity: new Vector3(
          Math.cos(angle) * speed,
          Math.random() * 2 + 1,
          Math.sin(angle) * speed
        ),
        life: 1.0,
        maxLife: 1.0,
        color: color,
        size: 3 + Math.random() * 4,
      };

      this.particles.push(particle);
    }
  }

  // Create sparkle effect
  public createSparkle(position: Vector3, color: number): void {
    const particle: Particle = {
      position: position.clone(),
      velocity: new Vector3(
        (Math.random() - 0.5) * 2,
        Math.random() * 3 + 2,
        (Math.random() - 0.5) * 2
      ),
      life: 1.0,
      maxLife: 1.0,
      color: color,
      size: 2 + Math.random() * 3,
    };

    this.particles.push(particle);
  }

  // Update all particles
  public update(deltaTime: number): void {
    // Update particle physics
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];

      // Apply gravity
      particle.velocity.y -= 9.8 * deltaTime;

      // Update position
      particle.position.add(
        particle.velocity.clone().multiplyScalar(deltaTime)
      );

      // Update life
      particle.life -= deltaTime;

      // Remove dead particles
      if (particle.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Render particles
    this.renderParticles();
  }

  private renderParticles(): void {
    // Convert 3D positions to screen coordinates (simplified)
    const particlesHTML = this.particles
      .map((particle) => {
        const alpha = particle.life / particle.maxLife;
        const hexColor =
          "#" + ("000000" + particle.color.toString(16)).slice(-6);

        // Simple 2D projection (in a real implementation, you'd use proper 3D projection)
        const screenX = 50 + particle.position.x * 10;
        const screenY = 50 + particle.position.y * 10;

        return `
        <div class="particle" style="
          left: ${screenX}%;
          top: ${screenY}%;
          width: ${particle.size}px;
          height: ${particle.size}px;
          background-color: ${hexColor};
          opacity: ${alpha};
          transform: translate(-50%, -50%);
        "></div>
      `;
      })
      .join("");

    this.container.innerHTML = particlesHTML;
  }

  // Clear all particles
  public clear(): void {
    this.particles = [];
    this.container.innerHTML = "";
  }
}

export const particleSystem = new ParticleSystem();
