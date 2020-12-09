// import { io } from "socket.io-client";
import { Pocket, Rail, drawBackground } from "./Objects/Table";
import { Ball } from "./Objects/Ball";

import { ballSize, ballStartLocations, pocketLocations, pocketSize } from "./parameters";

import "./global.scss";
import "./style.scss";

// const server = io();

const canvas = document.getElementById("table") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;

const canvasSize = () => ({ width: canvas.width, height: canvas.height });

const size = 2000;

const scale = window.devicePixelRatio || 1;
canvas.width = Math.floor(size * scale);
canvas.height = Math.floor((size / 2) * scale);

ctx.scale(scale, scale);

// 2D array of pocket locations. wont really need changing
const pockets = Array.from(pocketLocations(canvasSize()), (p) => new Pocket({ x: p[0], y: p[1] }, { width: pocketSize }));

const balls = Array.from(ballStartLocations, (ball) => new Ball({ x: ball[0], y: ball[1] }, { width: ballSize }, true));

const rails = [
  // Top Rails
  new Rail({ width: canvas.width, height: canvas.height }, 0, "top", "first"),
  new Rail({ width: canvas.width, height: canvas.height }, 0, "top", "second"),

  // Side Rails
  new Rail({ width: canvas.width, height: canvas.height }, 270, "side", "first"),
  new Rail({ width: canvas.width, height: canvas.height }, 90, "side", "second"),

  // Bottom Rails
  new Rail({ width: canvas.width, height: canvas.height }, 180, "bottom", "first"),
  new Rail({ width: canvas.width, height: canvas.height }, 180, "bottom", "second"),
];

let playerMoving: Ball | null = null;

canvas.addEventListener("mousedown", (event) => {
  const rect = canvas.getBoundingClientRect();

  const mouseX = ((event.clientX - rect.left) / (rect.right - rect.left)) * canvas.width;
  const mouseY = ((event.clientY - rect.top) / (rect.bottom - rect.top)) * canvas.height;

  for (let i = 0; i <= balls.length - 1; i++) {
    if (balls[i].cue) {
      const direction = [balls[i].position.x - mouseX, balls[i].position.y - mouseY];

      const dirMagnitude = Math.sqrt(Math.pow(direction[0], 2) + Math.pow(direction[1], 2));
      const dirNormalized = [direction[0] / dirMagnitude, direction[1] / dirMagnitude];

      balls[i].updateAcceleration(dirNormalized[0] * 3, dirNormalized[1] * 3);
    }
  }
});

// canvas.addEventListener("mousedown", event => {
//   const rect = canvas.getBoundingClientRect();

//   const mouseX = (event.clientX - rect.left) / (rect.right - rect.left) * canvas.width;
//   const mouseY = (event.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height;

//   if (playerMoving) {
//     playerMoving = null;
//   } else {
//     for(let i = 0; i <= balls.length - 1; i++) {
//       if (balls[i].clicked(mouseX, mouseY)) {
//         playerMoving = balls[i];
//       }
//     }
//   }
// });

// canvas.addEventListener("mousemove", event => {
//   if (playerMoving) {
//     const rect = canvas.getBoundingClientRect();

//     const mouseX = (event.clientX - rect.left) / (rect.right - rect.left) * canvas.width;
//     const mouseY = (event.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height;

//     playerMoving.move(mouseX, mouseY);
//   }
// });

// canvas.addEventListener("mouseup", () => {
//   playerMoving = null;
// });

const draw = () => {
  drawBackground(canvasSize(), ctx);

  pockets.forEach((pocket) => pocket.draw(ctx));

  rails.forEach((rail) => rail.draw(ctx));

  balls.forEach((ball) => {
    if (!playerMoving) {
      ball.updatePosition();

      if (ball.position.x < 0 || ball.position.y < 0 || ball.position.x > canvas.width || ball.position.y > canvas.height) ball.reset();

      if (Math.abs(ball.velocity.x) > 1 || Math.abs(ball.velocity.y) > 1) {
        if (rails.some((rail) => rail.collide(ball))) {
          // alert("damn");
        }

        if (pockets.some((pocket) => pocket.didSink(ball))) {
          // alert("wooo");
        }
      }
    }

    ball.draw(ctx);
  });

  window.requestAnimationFrame(draw);
};

window.requestAnimationFrame(draw);

// socket.on("connect", () => {
//   console.log(socket.connected); // true
// });

// socket.on("disconnect", () => {
//   console.log(socket.connected); // false
// });
