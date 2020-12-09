import { Interactable } from "./Interactable";
import { Ball } from "./Ball";

import { Coordinate, Size, Degrees } from "../types";
import { pocketSizeOffset, railThickness } from "../parameters";

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
  }

  draw = (ctx: CanvasRenderingContext2D) => {
    // Orientations
    // |_|[----------1-----------]|_|
    // |3|                        |4|
    // |_|[----------2-----------]|_|
    const determinePoints = (): number[][] => {
      const railOnePoints = [
        [railThickness, railThickness],
        [this.length - railThickness, railThickness],
        [this.length, 0],
      ];

      const railTwoPoints = [
        [railThickness, -railThickness],
        [this.length - railThickness, -railThickness],
        [this.length, 0],
      ];

      const railThreePoints = [
        [railThickness, railThickness],
        [railThickness, this.length - railThickness],
        [0, this.length],
      ];

      const railFourPoints = [
        [-railThickness, railThickness],
        [-railThickness, this.length - railThickness],
        [0, this.length],
      ];

      if (this.orientation === "top") {
        return railOnePoints;
      }

      if (this.orientation === "side" && this.order === "first") {
        return railThreePoints;
      }

      if (this.orientation === "side" && this.order === "second") {
        return railFourPoints;
      }

      if (this.orientation === "bottom") {
        return railTwoPoints;
      }

      return railOnePoints;
    };

    ctx.fillStyle = "saddlebrown";

    // ctx.translate(this.position.x, this.position.y);
    // ctx.rotate(this.rotation * (Math.PI / 180));
    // ctx.translate(-this.position.x, -this.position.y);

    ctx.beginPath();
    ctx.moveTo(this.position.x, this.position.y);

    const points = determinePoints();

    points.forEach((point) => {
      ctx.lineTo(point[0] + this.position.x, point[1] + this.position.y);
    });

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
