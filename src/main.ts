import { Game } from './game';

const game = new Game();

function onResize() {
  game.resize(window.innerWidth, window.innerHeight);
}

function onMove(event: TouchEvent | MouseEvent) {
  event.preventDefault();
  game.action();
}

function onLoad() {
  game.prepare(window.innerWidth, window.innerHeight);
  game.start();

  window.addEventListener('resize', onResize, false);
  window.addEventListener('orientationchange', onResize, false);
  window.addEventListener('touchmove', onMove, false);
  window.addEventListener('mousemove', onMove, false);
}

window.addEventListener('load', onLoad, false);
