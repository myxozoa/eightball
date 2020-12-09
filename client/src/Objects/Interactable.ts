import { Coordinate, Size } from "../types";

export class Interactable {
  size: Size;
  position: Coordinate;

  constructor(position: Coordinate, size: Size) {
    this.position = position;
    this.size = size;
  }
}
