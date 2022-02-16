import { Easing, Tween, update as tweenjsUpdate } from '@tweenjs/tween.js';
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
      this.moveCurrentBlock();
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
    if (this.state === 'playing') return;
    this.colorOffset = Math.round(Math.random() * 100);
    this.scoreContainer.innerHTML = '0';
    this.updateState('playing');
    this.addBlock(this.blocks[0]);
  }

  private restartGame() {
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

  private endGame() {
    this.updateState('ended');
  }

  private placeBlock() {
    const length = this.blocks.length;
    const targetBlock = this.blocks[length - 2];
    const currentBlock = this.blocks[length - 1];

    const result = currentBlock.cut(targetBlock);
    if (result === false) {
      this.stage.remove(currentBlock.getMesh());
      this.endGame();
    } else {
      this.scoreContainer.innerHTML = String(length - 1);
      this.addBlock(currentBlock);
    }
  }

  private addBaseBlock() {
    const block = new Block(10, 2, 10);
    this.stage.add(block.getMesh());
    this.blocks.push(block);
    block.setColor(0x333344);
  }

  private addBlock(targetBlock: Block) {
    const length = this.blocks.length;

    const block = new Block(targetBlock.width, targetBlock.height, targetBlock.depth);
    this.stage.add(block.getMesh());
    this.blocks.push(block);

    block.setColor(this.getNextBlockColor());
    block.position.set(
      targetBlock.position.x,
      targetBlock.height * length,
      targetBlock.position.z,
    );

    if (length % 2 === 0) {
      block.direction.x = Math.random() > 0.5 ? 1 : -1;
    } else {
      block.direction.z = Math.random() > 0.5 ? 1 : -1;
    }

    block.moveScalar(12);
    this.stage.setCamera(block.position.y);

    this.scoreContainer.innerHTML = String(length - 1);
    if (length >= 5) this.instructions.classList.add('hide');
  }

  private moveCurrentBlock() {
    if (this.state !== 'playing') return;

    const length = this.blocks.length;
    if (length < 2) return;

    const currentBlock = this.blocks[length - 1];
    const speed = -0.2;
    currentBlock.moveScalar(speed);
  }

  private getNextBlockColor() {
    const offset = this.blocks.length + this.colorOffset;
    const r = Math.sin(0.3 * offset) * 55 + 200;
    const g = Math.sin(0.3 * offset + 2) * 55 + 200;
    const b = Math.sin(0.3 * offset + 4) * 55 + 200;
    return (r << 16) + (g << 8) + (b);
  }
}
