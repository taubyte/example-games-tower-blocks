import { Block } from './block';
import { Stage } from './stage';

type GameState = 'loading' | 'ready' | 'playing' | 'ended' | 'resetting';

export class Game {
  private mainContainer: HTMLElement;
  private scoreContainer: HTMLElement;
  private requestId: number;

  private state: GameState = 'loading';
  private stage: Stage;

  public prepare(width: number, height: number) {
    this.mainContainer = document.getElementById('container');
    this.scoreContainer = document.getElementById('score');
    this.scoreContainer.innerHTML = '0';

    this.stage = new Stage();
    this.stage.resize(width, height);

    this.updateState('ready');
  }

  public start() {
    // place the first block
    this.placeBlock();
    // start/resume game
    this.resume();
  }

  public pause() {
    cancelAnimationFrame(this.requestId);
  }

  public resume() {
    this.requestId = requestAnimationFrame(() => {
      this.render();
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
    }
  }

  private restartGame() {
    this.updateState('resetting');
  }

  private endGame() {
    this.updateState('ended');
  }

  private placeBlock() {
    const block = new Block(10, 2, 10);
    this.stage.add(block.getMesh());
  }
}
