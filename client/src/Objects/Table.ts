import { Interactable } from "./Interactable";
import { Ball } from "./Ball";

import { Coordinate, Size, Degrees } from "../types";
import { ballSize, pocketSizeOffset, railThickness } from "../parameters";

const arrayToCoord = (array: number[]): Coordinate => ({ x: array[0], y: array[1] });

const distanceBetweenPoints = (a: Coordinate, b: Coordinate): number => Math.hypot(b.x - a.x, b.y - a.y);

const dotProduct = (a: Coordinate, b: Coordinate): number => a.x * b.x + (a.y + b.y);

const closestPointOnLineSegment = (a: Coordinate, b: Coordinate, p: Coordinate): Coordinate => {
  // line segment being tested is AB
  const vectorA2P: Coordinate = { x: p.x - a.x, y: p.y - a.y };
  const vectorA2B: Coordinate = { x: b.x - a.x, y: b.y - a.y };

  const magnitude = Math.pow(distanceBetweenPoints(a, b), 2);
  const ABAP_dotProduct = dotProduct(vectorA2P, vectorA2B);
  const distance = ABAP_dotProduct / magnitude;

  if (distance < 0) return a;
  else if (distance > 1) return b;
  else return { x: a.x + vectorA2B.x * distance, y: a.y + vectorA2B.y * distance };
};

export class Pocket extends Interactable {
  constructor(position: Coordinate, size: Size) {
    super(position, size);
  }

  didSink = (ball: Ball): boolean => {
    // true if the center a ball comes within the circle representing the pocket
    return Boolean(Math.pow(ball.position.x - this.position.x, 2) + Math.pow(ball.position.y - this.position.y, 2) <= Math.pow(this.size.width, 2));
  };

  draw = (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.ellipse(this.position.x, this.position.y, this.size.width, this.size.width, 0, 0, 360);
    ctx.fill();
  };
}

export class Rail {
  position: Coordinate;
  length: number;
  rotation: Degrees;
  orientation: "top" | "side" | "bottom";
  order: "first" | "second";
  points: number[][];

  constructor(canvasSize: Size, rotation: Degrees, orientation: "top" | "side" | "bottom", order: "first" | "second") {
    this.length = canvasSize.height! - pocketSizeOffset * (orientation === "side" ? 4 : 3);
    this.rotation = rotation;
    this.orientation = orientation;
    this.order = order;

    switch (orientation) {
      case "top":
        if (order === "first") {
          this.position = { x: pocketSizeOffset * 2, y: 0 };
        } else {
          this.position = { x: canvasSize.width / 2 + pocketSizeOffset, y: 0 };
        }
        break;
      case "side":
        if (order === "first") {
          this.position = { x: 0, y: pocketSizeOffset * 2 };
        } else {
          this.position = { x: canvasSize.width, y: pocketSizeOffset * 2 };
        }
        break;
      case "bottom":
        if (order === "first") {
          this.position = { x: pocketSizeOffset * 2, y: canvasSize.height! };
        } else {
          this.position = { x: canvasSize.width / 2 + pocketSizeOffset, y: canvasSize.height! };
        }
        break;
    }

    this.points = this.determinePoints();
  }

  private determinePoints = (): number[][] => {
    // Orientations
    // |_|[----------1-----------]|_|
    // |3|                        |4|
    // |_|[----------2-----------]|_|

    let points: number[][] = [];

    if (this.orientation === "top") {
      points = [
        [0, 0],
        [0, pocketSizeOffset],
        [railThickness, railThickness + pocketSizeOffset],
        [this.length - railThickness, railThickness + pocketSizeOffset],
        [this.length, pocketSizeOffset],
        [this.length, 0],
      ];
    }

    if (this.orientation === "side" && this.order === "first") {
      points = [
        [0, 0],
        [pocketSizeOffset, 0],
        [railThickness + pocketSizeOffset, railThickness],
        [railThickness + pocketSizeOffset, this.length - railThickness],
        [pocketSizeOffset, this.length],
        [0, this.length],
      ];
    }

    if (this.orientation === "side" && this.order === "second") {
      points = [
        [0, 0],
        [-pocketSizeOffset, 0],
        [-railThickness - pocketSizeOffset, railThickness],
        [-railThickness - pocketSizeOffset, this.length - railThickness],
        [-pocketSizeOffset, this.length],
        [0, this.length],
      ];
    }

    if (this.orientation === "bottom") {
      points = [
        [0, 0],
        [0, -pocketSizeOffset],
        [railThickness, -railThickness - pocketSizeOffset],
        [this.length - railThickness, -railThickness - pocketSizeOffset],
        [this.length, -pocketSizeOffset],
        [this.length, 0],
      ];
    }

    return points.map((point) => {
      const temp = [...point];

      temp[0] += this.position.x;
      temp[1] += this.position.y;

      return temp;
    });
  };

  // Ball -> wall collisions
  collide = (ball: Ball, ctx: CanvasRenderingContext2D) => {
    let next = 0;

    for (let current = 0; current < this.points.length; current++) {
      next = current + 1;
      if (next == this.points.length) next = 0;

      const currentPoints = this.points[current];
      const nextPoints = this.points[next];

      const p = closestPointOnLineSegment(arrayToCoord(currentPoints), arrayToCoord(nextPoints), ball.position);

      const distance = distanceBetweenPoints(p, ball.position);

      if (distance < ballSize && distance > 0) {
        // const ballTrajectory = [ball.position, {x: ball.position.x - (ball.velocity.x * 10 ), y: ball.position.y - (ball.velocity.y * 10)}];
        const distanceToMove = ballSize - distance;
        const magnitude = Math.sqrt(ball.velocity.x * ball.velocity.x + ball.velocity.y * ball.velocity.y);

        const normalizedBallTrajectory = [(ball.velocity.x / magnitude) * distanceToMove, (ball.velocity.y / magnitude) * distanceToMove];
        const newBallPosition: Coordinate = { x: ball.position.x - normalizedBallTrajectory[0], y: ball.position.y - normalizedBallTrajectory[1] };

        console.log(ball.velocity);
        ball.setPosition(newBallPosition);
        return true;
      }
    }

    return false;
  };

  draw = (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = "saddlebrown";

    ctx.beginPath();
    ctx.moveTo(this.position.x, this.position.y);

    for (let i = 1; i < this.points.length; i++) {
      ctx.lineTo(this.points[i][0], this.points[i][1]);
    }

    ctx.fill();

    // reset rotation/translation
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  };
}

export const drawBackground = (canvasSize: Size, ctx: CanvasRenderingContext2D) => {
  // ctx.fillStyle = "saddlebrown";
  ctx.fillStyle = "green";
  ctx.fillRect(0, 0, canvasSize.width, canvasSize.height!);

  // ctx.fillStyle = "green";
  // ctx.fillRect(pocketSizeOffset, pocketSizeOffset, canvasSize.width - pocketSizeOffset * 2, canvasSize.height! - pocketSizeOffset * 2);
};
