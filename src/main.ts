import { Game } from './game';

const game = new Game();

function onResize() {
  game.resize(window.innerWidth, window.innerHeight);
}

function onTouch(event: TouchEvent) {
  event.preventDefault();
  game.action();
}

function onClick(event: MouseEvent) {
  event.preventDefault();
  game.action();
}

function onLoad() {
  game.prepare(window.innerWidth, window.innerHeight);
  game.start();

  window.addEventListener('resize', onResize, false);
  window.addEventListener('orientationchange', onResize, false);
  window.addEventListener('touchstart', onTouch, { passive:false });
  window.addEventListener('mousedown', onClick, false);
}

window.addEventListener('load', onLoad, false);
