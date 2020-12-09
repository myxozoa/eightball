import { Interactable } from "./Interactable";
import { Ball } from "./Ball";

import { Coordinate, Size, Degrees } from "../types";
import { ballSize, pocketSizeOffset, railThickness } from "../parameters";

const dist = (x1: number, x2: number, y1: number, y2: number): number => {
  const a = x1 - x2;
  const b = y2 - y1;

  return Math.sqrt(a * a + b * b);
};

// LINE/POINT
const linePoint = (x1: number, y1: number, x2: number, y2: number, px: number, py: number): boolean => {
  // get distance from the point to the two ends of the line
  const d1 = dist(px, py, x1, y1);
  const d2 = dist(px, py, x2, y2);

  // get the length of the line
  const lineLen = dist(x1, y1, x2, y2);

  // since floats are so minutely accurate, add
  // a little buffer zone that will give collision
  const buffer = 0.1; // higher # = less accurate

  // if the two distances are equal to the line's
  // length, the point is on the line!
  // note we use the buffer here to give a range, rather
  // than one #
  if (d1 + d2 >= lineLen - buffer && d1 + d2 <= lineLen + buffer) {
    return true;
  }
  return false;
};

// LINE/CIRCLE
const lineCircle = (x1: number, y1: number, x2: number, y2: number, cx: number, cy: number, r: number): boolean => {
  // is either end INSIDE the circle?
  // if so, return true immediately
  // const inside1 = pointCircle(x1,y1, cx,cy,r);
  // const inside2 = pointCircle(x2,y2, cx,cy,r);
  // if (inside1 || inside2) return true;

  // get length of the line
  const len = dist(x1, x2, y1, y2);

  // get dot product of the line and circle
  const dot = ((cx - x1) * (x2 - x1) + (cy - y1) * (y2 - y1)) / Math.pow(len, 2);

  // find the closest point on the line
  const closestX = x1 + dot * (x2 - x1);
  const closestY = y1 + dot * (y2 - y1);

  // is this point actually on the line segment?
  // if so keep going, but if not, return false
  const onSegment = linePoint(x1, y1, x2, y2, closestX, closestY);
  if (!onSegment) return false;

  // get distance to closest point
  const distance = dist(closestX, closestY, cx, cy);

  console.log(len, distance);

  // is the circle on the line?
  if (distance <= r) {
    return true;
  }
  return false;
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
          this.position = { x: pocketSizeOffset * 2, y: pocketSizeOffset };
        } else {
          this.position = { x: canvasSize.width / 2 + pocketSizeOffset, y: pocketSizeOffset };
        }
        break;
      case "side":
        if (order === "first") {
          this.position = { x: pocketSizeOffset, y: pocketSizeOffset * 2 };
        } else {
          this.position = { x: canvasSize.width - pocketSizeOffset, y: pocketSizeOffset * 2 };
        }
        break;
      case "bottom":
        if (order === "first") {
          this.position = { x: pocketSizeOffset * 2, y: canvasSize.height! - pocketSizeOffset };
        } else {
          this.position = { x: canvasSize.width / 2 + pocketSizeOffset, y: canvasSize.height! - pocketSizeOffset };
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
        [railThickness, railThickness],
        [this.length - railThickness, railThickness],
        [this.length, 0],
      ];
    }

    if (this.orientation === "side" && this.order === "first") {
      points = [
        [0, 0],
        [railThickness, railThickness],
        [railThickness, this.length - railThickness],
        [0, this.length],
      ];
    }

    if (this.orientation === "side" && this.order === "second") {
      points = [
        [0, 0],
        [-railThickness, railThickness],
        [-railThickness, this.length - railThickness],
        [0, this.length],
      ];
    }

    if (this.orientation === "bottom") {
      points = [
        [0, 0],
        [railThickness, -railThickness],
        [this.length - railThickness, -railThickness],
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
  collide = (ball: Ball) => {
    let next = 0;
    for (let current = 0; current < this.points.length; current++) {
      next = current + 1;
      if (next == this.points.length) next = 0;

      const vc = this.points[current];
      const vn = this.points[next];

      const collision = lineCircle(vc[0], vc[1], vn[0], vn[1], ball.position.x, ball.position.y, ballSize);

      if (collision) return true;
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
  ctx.fillStyle = "saddlebrown";
  ctx.fillRect(0, 0, canvasSize.width, canvasSize.height!);

  ctx.fillStyle = "green";
  ctx.fillRect(pocketSizeOffset, pocketSizeOffset, canvasSize.width - pocketSizeOffset * 2, canvasSize.height! - pocketSizeOffset * 2);
};
