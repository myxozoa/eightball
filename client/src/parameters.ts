import { Size } from "./types";

export const tableFriction = 0.95;
export const pocketSize = 52;
export const pocketSizeOffset = pocketSize * 1.05;
export const railThickness = 26;

export const pocketLocations = (canvasSize: Size) => [
  [pocketSize, pocketSize],
  [canvasSize.width / 2, pocketSize],
  [canvasSize.width - pocketSize, pocketSize],
  [pocketSize, canvasSize.height! - pocketSize],
  [canvasSize.width / 2, canvasSize.height! - pocketSize],
  [canvasSize.width - pocketSize, canvasSize.height! - pocketSize],
];
export const ballStartLocations = [[300, 300]];
