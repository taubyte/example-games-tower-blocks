import { Game } from './game';

const game = new Game();

function onResize() {
  game.resize(window.innerWidth, window.innerHeight);
}

function onTouchStart(event: TouchEvent) {
  event.preventDefault();
  game.action();
}

function onMouseDown(event: MouseEvent) {
  event.preventDefault();
  game.action();
}

function onKeyDown(event: KeyboardEvent) {
  if (event.code === 'Space') {
    game.action();
  }
}

function onLoad() {
  game.prepare(window.innerWidth, window.innerHeight);
  game.start();

  window.addEventListener('resize', onResize, false);
  window.addEventListener('orientationchange', onResize, false);
  window.addEventListener('touchstart', onTouchStart, { passive: false });
  window.addEventListener('mousedown', onMouseDown, false);
  window.addEventListener('keydown', onKeyDown, false);
}

window.addEventListener('load', onLoad, false);
