import { Interactable } from "./Interactable";
import { pocketSizeOffset, tableFriction } from "../parameters";

import { Coordinate, Size } from "../types";

export class Ball extends Interactable {
  cue: boolean;
  acceleration: Coordinate;
  velocity: Coordinate;

  constructor(position: Coordinate, size: Size, cue: boolean) {
    super(position, size);
    this.cue = cue;
    this.acceleration = { x: 0, y: 0 };
    this.velocity = { x: 0, y: 0 };
  }

  stop = () => {
    this.acceleration = { x: 0, y: 0 };
    this.velocity = { x: 0, y: 0 };
  };

  setPosition = (position: Coordinate, keepMoving?: boolean) => {
    if (!keepMoving) {
      this.acceleration = { x: 0, y: 0 };
      this.velocity = { x: 0, y: 0 };
    }

    this.position = position;
  };

  updatePosition = () => {
    this.updateVelocity();

    this.position.x = this.position.x + this.velocity.x;
    this.position.y = this.position.y + this.velocity.y;
  };

  updateVelocity = () => {
    this.decellerate();

    this.velocity.x = (this.velocity.x + this.acceleration.x) * tableFriction;
    this.velocity.y = (this.velocity.y + this.acceleration.y) * tableFriction;
  };

  decellerate = () => {
    this.acceleration.x *= tableFriction;
    this.acceleration.y *= tableFriction;
  };

  updateAcceleration = (x: number, y: number) => {
    this.acceleration.x = x;
    this.acceleration.y = y;
  };

  move = (x: number, y: number) => {
    this.position.x = x;
    this.position.y = y;
  };

  clicked = (x: number, y: number) => {
    const radius = this.size.width;
    return x > this.position.x - radius && x < this.position.x + radius && y > this.position.y - radius && y < this.position.y + radius;
  };

  draw = (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.ellipse(this.position.x, this.position.y, this.size.width, this.size.width, 0, 0, 360);
    ctx.fill();
  };

  reset = () => {
    this.acceleration = { x: 0, y: 0 };
    this.velocity = { x: 0, y: 0 };
    this.position = { x: 500, y: 500 };
  };
}
