export type AnimalShape = "round" | "square";

export interface AnimalData {
  id: string;
  shape: AnimalShape;
  frameKey: string;
  x: number;
  y: number;
}

export interface GameConfig {
  totalLives: number;
  animalCount: number;
  dropZoneHeight: number;
}

export const DEFAULT_CONFIG: GameConfig = {
  totalLives: 5,
  animalCount: 8,
  dropZoneHeight: 130,
};

export type GameState = "playing" | "win" | "lose";

export interface GameModelState {
  lives: number;
  remaining: number;
  total: number;
  state: GameState;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}
