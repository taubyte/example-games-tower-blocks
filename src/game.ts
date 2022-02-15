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
    this.addBlock(10, 2, 10, 0x333344);

    this.updateState('ready');
  }

  public start() {
    this.resume();
  }

  public pause() {
    cancelAnimationFrame(this.requestId);
  }

  public resume() {
    this.requestId = requestAnimationFrame(() => {
      this.render();
      this.resume();
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
      this.scoreContainer.innerHTML = '0';
      this.updateState('playing');
      this.colorOffset = Math.round(Math.random() * 100);
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
    const offset = length + this.colorOffset;
    const r = Math.sin(0.3 * offset) * 55 + 200;
    const g = Math.sin(0.3 * offset + 2) * 55 + 200;
    const b = Math.sin(0.3 * offset + 4) * 55 + 200;
    const color = (r << 16) + (g << 8) + (b);
    this.addBlock(width, height, depth, color);
  }

  private addBlock(width: number, height: number, depth: number, color: number) {
    const length = this.blocks.length;

    const block = new Block(width, height, depth);
    this.stage.add(block.getMesh());
    this.blocks.push(block);

    block.setColor(color);
    block.position.y = height * length;
    this.stage.setCcameraPosition(2, height * length, 2);

    this.scoreContainer.innerHTML = String(length - 1);
    if (length >= 5) this.instructions.classList.add('hide');
  }
}
