import { update as tweenjsUpdate } from '@tweenjs/tween.js';
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

  public prepare(width: number, height: number) {
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

  public start() {
    this.update();
  }

  public pause() {
    cancelAnimationFrame(this.requestId);
  }

  public update() {
    this.requestId = requestAnimationFrame((time: number) => {
      tweenjsUpdate(time);
      this.moveLastBlock();
      this.render();
      this.update();
    });
  }

  public render() {
    this.stage.render();
  }

  public resize(width: number, height: number) {
    this.stage.resize(width, height);
  }

  private updateState(newState: GameState) {
    this.mainContainer.classList.remove(this.state);
    this.state = newState;
    this.mainContainer.classList.add(this.state);
  }

  public action() {
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

  private startGame() {
    if (this.state !== 'playing') {
      this.colorOffset = Math.round(Math.random() * 100);
      this.scoreContainer.innerHTML = '0';
      this.updateState('playing');
      this.placeBlock();
    }
  }

  private restartGame() {
    this.updateState('resetting');
  }

  private endGame() {
    this.updateState('ended');
  }

  private placeBlock() {
    const length = this.blocks.length;
    const lastBlock = this.blocks[length - 1];
    this.scoreContainer.innerHTML = String(length - 1);
    
    const { width, height, depth } = lastBlock.getDimesion();
    this.addBlock(width, height, depth);
  }

  private addBaseBlock() {
    const block = new Block(10, 2, 10);
    this.stage.add(block.getMesh());
    this.blocks.push(block);
  }

  private addBlock(width: number, height: number, depth: number) {
    const length = this.blocks.length;

    const block = new Block(width, height, depth);
    this.stage.add(block.getMesh());
    this.blocks.push(block);

    block.setColor(this.getNextBlockColor());
    block.position.y = height * length;

    if (length % 2 === 0) {
      block.direction.x = Math.random() > 0.5 ? 1 : -1;
    } else {
      block.direction.z = Math.random() > 0.5 ? 1 : -1;
    }
    block.moveScalar(12);
    this.stage.setCamera(height * length);

    this.scoreContainer.innerHTML = String(length - 1);
    if (length >= 5) this.instructions.classList.add('hide');
  }

  private moveLastBlock() {
    const length = this.blocks.length;
    if (length < 2) return;
    const lastBlock = this.blocks[length - 1];
    const speed = -0.1;
    lastBlock.moveScalar(speed);
  }

  private getNextBlockColor() {
    const offset = this.blocks.length + this.colorOffset;
    const r = Math.sin(0.3 * offset) * 55 + 200;
    const g = Math.sin(0.3 * offset + 2) * 55 + 200;
    const b = Math.sin(0.3 * offset + 4) * 55 + 200;
    return (r << 16) + (g << 8) + (b);
  }
}
