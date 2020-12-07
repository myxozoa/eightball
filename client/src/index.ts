// import { io } from "socket.io-client";
import { decodedTextSpanIntersectsWith } from 'typescript';
import './global.scss';
import './style.scss';

// const server = io();

class Interactable {
  width: number;
  height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }
}

class Pocket extends Interactable {
  x: number;
  y: number;

  constructor(x: number, y: number, size: number) {
    super(size, size);
    this.x = x;
    this.y = y;
  }
}

const canvas = document.getElementById('table') as HTMLCanvasElement;

const pocketSize = 55;
const pocketSizeOffset = pocketSize * 1.05;
const railThickness = 25;
const railLength = canvas.height - (pocketSizeOffset * 3);
const vRailLength = canvas.height - (pocketSizeOffset * 4);

// 2D array of pocket locations. wont really need changing
const pocketLocations = [[pocketSize, pocketSize], [canvas.width / 2, pocketSize], [canvas.width - pocketSize, pocketSize], [pocketSize, canvas.height - pocketSize], [canvas.width / 2, canvas.height - pocketSize], [canvas.width - pocketSize, canvas.height - pocketSize]];

const pockets = Array.from(pocketLocations, p => new Pocket(p[0], p[1], pocketSize));

const ctx = canvas.getContext('2d')!;

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

// Top Rails
drawRail(pocketSizeOffset * 2, pocketSizeOffset, railLength, 0, ctx);
drawRail((canvas.width / 2) + pocketSizeOffset, pocketSizeOffset, railLength, 0, ctx);

// Side Rails
drawRail(pocketSizeOffset, (pocketSizeOffset * 2) + vRailLength, vRailLength, 270, ctx);
drawRail(canvas.width - pocketSizeOffset, pocketSizeOffset * 2, vRailLength, 90, ctx);

// Bottom Rails
drawRail((pocketSizeOffset * 2) + railLength, canvas.height - pocketSizeOffset, railLength, 180, ctx);
drawRail(((canvas.width / 2) + pocketSizeOffset) + railLength, canvas.height - pocketSizeOffset, railLength, 180, ctx);


// socket.on("connect", () => {
//   console.log(socket.connected); // true
// });

// socket.on("disconnect", () => {
//   console.log(socket.connected); // false
// });
