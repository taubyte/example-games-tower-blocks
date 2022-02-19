import { Easing, Tween, update as tweenjsUpdate } from '@tweenjs/tween.js';
import { Vector3 } from 'three';
import { Block } from './block';
import { Stage } from './stage';

type GameState = 'loading' | 'ready' | 'playing' | 'ended' | 'resetting';

export class Game {
  private mainContainer: HTMLElement;
  private scoreContainer: HTMLElement;
  private instructions: HTMLElement;
  private requestId: number;

  private state: GameState = 'loading';
  private stage: Stage;
  private blocks: Block[];

  private colorOffset: number;

  public prepare(width: number, height: number): void {
    this.mainContainer = document.getElementById('container');
    this.scoreContainer = document.getElementById('score');
    this.instructions = document.getElementById('instructions');
    this.scoreContainer.innerHTML = '0';

    this.stage = new Stage();
    this.stage.resize(width, height);

    this.blocks = [];
    this.addBaseBlock();

    this.updateState('ready');
  }

  public start(): void {
    this.update();
  }

  public pause(): void {
    cancelAnimationFrame(this.requestId);
  }

  public update(): void {
    this.requestId = requestAnimationFrame((time: number) => {
      tweenjsUpdate(time);
      this.moveCurrentBlock();
      this.render();
      this.update();
    });
  }

  public render(): void {
    this.stage.render();
  }

  public resize(width: number, height: number): void {
    this.stage.resize(width, height);
  }

  private updateState(newState: GameState): void {
    this.mainContainer.classList.remove(this.state);
    this.state = newState;
    this.mainContainer.classList.add(this.state);
  }

  public action(): void {
    switch (this.state) {
      case 'ready':
        this.startGame();
        break;
      case 'playing':
        this.placeBlock();
        break;
      case 'ended':
        this.restartGame();
        break;
    }
  }

  private startGame(): void {
    if (this.state === 'playing') return;
    this.colorOffset = Math.round(Math.random() * 100);
    this.scoreContainer.innerHTML = '0';
    this.updateState('playing');
    this.addBlock(this.blocks[0]);
  }

  private restartGame(): void {
    this.updateState('resetting');

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
        })
        .start();

      new Tween(this.blocks[i].rotation)
        .to({ y: 0.5 }, duration)
        .delay((length - i - 1) * delay)
        .easing(Easing.Cubic.In)
        .start();
    }

    const cameraMoveSpeed = duration * 2 + length * delay;
    this.stage.setCamera(2, cameraMoveSpeed);

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
    this.updateState('ended');
  }

  private placeBlock(): void {
    const length = this.blocks.length;
    const targetBlock = this.blocks[length - 2];
    const currentBlock = this.blocks[length - 1];

    const result = currentBlock.cut(targetBlock);
    if (result === undefined) {
      this.stage.remove(currentBlock.getMesh());
      this.endGame();
    } else {
      this.scoreContainer.innerHTML = String(length - 1);
      this.addBlock(currentBlock);
      this.addChoppedBlock(result.position, result.scale, currentBlock);
    }
  }

  private addBaseBlock(): void {
    const block = new Block(new Vector3(10, 2, 10));
    this.stage.add(block.getMesh());
    this.blocks.push(block);
    block.color = 0x333344;
    block.y = -6;
  }

  private addBlock(targetBlock: Block): void {
    const block = new Block(targetBlock.scale);
    this.stage.add(block.getMesh());
    this.blocks.push(block);

    block.color = this.getNextBlockColor();
    block.position.copy(targetBlock.position);
    block.y += targetBlock.height;

    const length = this.blocks.length;
    if (length % 2 === 0) {
      block.direction.x = Math.random() > 0.5 ? 1 : -1;
    } else {
      block.direction.z = Math.random() > 0.5 ? 1 : -1;
    }

    block.moveScalar(12);
    this.stage.setCamera(block.y + 6);

    this.scoreContainer.innerHTML = String(length - 1);
    if (length >= 5) this.instructions.classList.add('hide');
  }

  private addChoppedBlock(
    position: Vector3,
    scale: Vector3,
    sourceBlock: Block,
  ): void {
    const block = new Block(scale);
    this.stage.add(block.getMesh());
    block.position.copy(position);
    block.color = sourceBlock.color;

    const dirX = Math.sign(block.x - sourceBlock.x);
    const dirZ = Math.sign(block.z - sourceBlock.z);
    new Tween(block.position)
      .to(
        {
          x: block.x + dirX * 10,
          y: block.y - 30,
          z: block.z + dirZ * 10,
        },
        1000,
      )
      .easing(Easing.Quadratic.In)
      .onComplete(() => {
        this.stage.remove(block.getMesh());
      })
      .start();

    new Tween(block.rotation)
      .to({ x: dirZ * 5, z: dirX * -5 }, 1000)
      .delay(50)
      .start();
  }

  private moveCurrentBlock(): void {
    if (this.state !== 'playing') return;

    const length = this.blocks.length;
    if (length < 2) return;

    const speed = 0.2 + Math.min(0.001 * length, 0.3);
    this.blocks[length - 1].moveScalar(speed);

    this.reverseDirection();
  }

  private reverseDirection(): void {
    const length = this.blocks.length;
    if (length < 2) return;

    const targetBlock = this.blocks[length - 2];
    const currentBlock = this.blocks[length - 1];

    const diffX = currentBlock.x - targetBlock.x;
    if (currentBlock.direction.x === 1 && diffX > 12) {
      currentBlock.direction.x = -1;
      return;
    }
    if (currentBlock.direction.x === -1 && diffX < -12) {
      currentBlock.direction.x = 1;
      return;
    }

    const diffZ = currentBlock.z - targetBlock.z;
    if (currentBlock.direction.z === 1 && diffZ > 12) {
      currentBlock.direction.z = -1;
      return;
    }
    if (currentBlock.direction.z === -1 && diffZ < -12) {
      currentBlock.direction.z = 1;
      return;
    }
  }

  private getNextBlockColor(): number {
    const offset = this.blocks.length + this.colorOffset;
    const r = Math.sin(0.3 * offset) * 55 + 200;
    const g = Math.sin(0.3 * offset + 2) * 55 + 200;
    const b = Math.sin(0.3 * offset + 4) * 55 + 200;
    return (r << 16) + (g << 8) + b;
  }
}
