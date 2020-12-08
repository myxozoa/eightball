// import { io } from "socket.io-client";
import { decodedTextSpanIntersectsWith } from 'typescript';
import './global.scss';
import './style.scss';

// const server = io();

class Interactable {
  width: number;
  height: number;
  x: number;
  y: number;

  constructor(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
}

class Ball extends Interactable {
  cue: boolean;
  speed: number;
  direction: number[];

  constructor(x: number, y: number, size: number, cue: boolean) {
    super(x, y ,size, size);
    this.cue = cue;
    this.speed = 0;
    this.direction = [0, 0];
  }

  move = (x: number, y: number) => {
    this.x = x;
    this.y = y;
  }

  clicked = (x: number, y: number) => {
    const radius = this.width;
    return (x > this.x - radius && x < this.x + radius) && (y > this.y - radius && y < this.y + radius);
  }
}

class Pocket extends Interactable {
  constructor(x: number, y: number, size: number) {
    super(x, y ,size, size);
    this.x = x;
    this.y = y;
  }

  didSink = (ball: Ball): boolean => {
    // true if the center a ball comes within the circle representing the pocket
    return Boolean(Math.pow(ball.x - this.x, 2) + 
    Math.pow(ball.y - this.y, 2) <= Math.pow(this.width, 2));
  }
}

const canvas = document.getElementById('table') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

const size = 2000;

const scale = window.devicePixelRatio || 1;
canvas.width = Math.floor(size * scale);
canvas.height = Math.floor((size / 2) * scale);

ctx.scale(scale, scale);

const tableFriction = 0.1;
const pocketSize = 52;
const pocketSizeOffset = pocketSize * 1.05;
const railThickness = 26;
const railLength = canvas.height - (pocketSizeOffset * 3);
const vRailLength = canvas.height - (pocketSizeOffset * 4);

// 2D array of pocket locations. wont really need changing
const pocketLocations = [[pocketSize, pocketSize], [canvas.width / 2, pocketSize], [canvas.width - pocketSize, pocketSize], [pocketSize, canvas.height - pocketSize], [canvas.width / 2, canvas.height - pocketSize], [canvas.width - pocketSize, canvas.height - pocketSize]];

const pockets = Array.from(pocketLocations, p => new Pocket(p[0], p[1], pocketSize));



const drawRail = (x: number, y: number, length: number, rotation: number, ctx: CanvasRenderingContext2D) => {
  const points = [[railThickness, railThickness], [length - railThickness, railThickness], [length, 0]];
  
  ctx.fillStyle = 'saddlebrown';

  ctx.translate(x, y);
  ctx.rotate(rotation * (Math.PI / 180));
  ctx.translate(-x, -y);

  ctx.beginPath();
  ctx.moveTo(x, y);

  points.forEach(point => {
    ctx.lineTo(point[0] + x, point[1] + y);
  });

  ctx.fill();

  // reset rotation/translation
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

const ballStartLocations = [[300, 300]];

const balls = Array.from(ballStartLocations, ball => new Ball(ball[0], ball[1], 50, true));

let playerMoving: Ball | null = null;
const moving: Ball[] = [];

canvas.addEventListener("mousedown", event => {
  const rect = canvas.getBoundingClientRect();

  const mouseX = (event.clientX - rect.left) / (rect.right - rect.left) * canvas.width;
  const mouseY = (event.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height;

  if (playerMoving) {
    playerMoving = null;
  } else {
    for(let i = 0; i <= balls.length - 1; i++) {
      if (balls[i].clicked(mouseX, mouseY)) {
        playerMoving = balls[i];
      }
    }
  }
});

canvas.addEventListener("mousemove", event => {
  const rect = canvas.getBoundingClientRect();

  const mouseX = (event.clientX - rect.left) / (rect.right - rect.left) * canvas.width;
  const mouseY = (event.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height;

  if (playerMoving) {
    playerMoving.move(mouseX, mouseY);
  }
});

canvas.addEventListener("mouseup", () => {
  playerMoving = null;
});

const background = () => {
  ctx.fillStyle = 'saddlebrown';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'green';
  ctx.fillRect(pocketSizeOffset, pocketSizeOffset, canvas.width - (pocketSizeOffset * 2), canvas.height - (pocketSizeOffset * 2));

  ctx.fillStyle = 'black';
  // draw all the pockets as black circles for now
  pockets.forEach((pocket) => {
    ctx.beginPath();
    ctx.ellipse(pocket.x, pocket.y, pocket.width, pocket.height, 0, 0, 360);
    ctx.fill();
  });

  // Top Rails
  drawRail(pocketSizeOffset * 2, pocketSizeOffset, railLength, 0, ctx);
  drawRail((canvas.width / 2) + pocketSizeOffset, pocketSizeOffset, railLength, 0, ctx);

  // Side Rails
  drawRail(pocketSizeOffset, (pocketSizeOffset * 2) + vRailLength, vRailLength, 270, ctx);
  drawRail(canvas.width - pocketSizeOffset, pocketSizeOffset * 2, vRailLength, 90, ctx);

  // Bottom Rails
  drawRail((pocketSizeOffset * 2) + railLength, canvas.height - pocketSizeOffset, railLength, 180, ctx);
  drawRail(((canvas.width / 2) + pocketSizeOffset) + railLength, canvas.height - pocketSizeOffset, railLength, 180, ctx);
}


const draw = () => {
  background();

  balls.forEach(ball => {
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.ellipse(ball.x, ball.y, ball.width, ball.width, 0, 0, 360);
    ctx.fill();
  });
  
  window.requestAnimationFrame(draw);
}

window.requestAnimationFrame(draw);

// socket.on("connect", () => {
//   console.log(socket.connected); // true
// });

// socket.on("disconnect", () => {
//   console.log(socket.connected); // false
// });
