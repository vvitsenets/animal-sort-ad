import {
  AnimalData,
  AnimalShape,
  GameConfig,
  GameModelState,
  GameState,
} from "../types/GameTypes";

export interface IGameModel {
  readonly lives: number;
  readonly state: GameState;
  readonly animals: ReadonlyArray<AnimalData>;
  onStateChange: (state: GameModelState) => void;
  placeAnimal(id: string, targetShape: AnimalShape): boolean;
  getSnapshot(): GameModelState;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export class GameModel implements IGameModel {
  private _lives: number;

  private _animals: AnimalData[];

  private _state: GameState = "playing";

  public onStateChange: (state: GameModelState) => void = () => {};

  constructor(
    private readonly config: GameConfig,
    stageW: number,
    stageH: number,
    roundFrames: string[],
    squareFrames: string[],
  ) {
    this._lives = config.totalLives;

    this._animals = this._generateAnimals(
      config.animalCount,
      stageW,
      stageH,
      roundFrames,
      squareFrames,
    );
  }

  private _generateAnimals(
    count: number,
    stageW: number,
    stageH: number,
    roundFrames: string[],
    squareFrames: string[],
  ): AnimalData[] {
    const half = Math.floor(count / 2);
    
    const rounds: AnimalData[] = shuffle(roundFrames)
      .slice(0, half)
      .map((frame, i) => ({
        id: `r${i}`,
        shape: "round" as const,
        frameKey: frame,
        x: this._safeX(stageW),
        y: this._safeY(stageH),
      }));

    const squares: AnimalData[] = shuffle(squareFrames)
      .slice(0, count - half)
      .map((frame, i) => ({
        id: `s${i}`,
        shape: "square" as const,
        frameKey: frame,
        x: this._safeX(stageW),
        y: this._safeY(stageH),
      }));

    return shuffle([...rounds, ...squares]);
  }

  private _safeX(_stageW: number): number {
    return 0.06 + Math.random() * 0.88;
  }

  private _safeY(_stageH: number): number {
    return 0.05 + Math.random() * 0.9;
  }

  get lives(): number {
    return this._lives;
  }
  get state(): GameState {
    return this._state;
  }
  get animals(): ReadonlyArray<AnimalData> {
    return this._animals;
  }

  placeAnimal(id: string, targetShape: AnimalShape): boolean {
    if (this._state !== "playing") return false;
    const idx = this._animals.findIndex((a) => a.id === id);
    if (idx === -1) return false;

    const correct = this._animals[idx].shape === targetShape;
    if (correct) {
      this._animals.splice(idx, 1);
    } else {
      this._lives = Math.max(0, this._lives - 1);
    }

    this._checkWinLose();
    this.onStateChange(this.getSnapshot());
    return correct;
  }

  private _checkWinLose(): void {
    if (this._animals.length === 0) this._state = "win";
    else if (this._lives === 0) this._state = "lose";
  }

  getSnapshot(): GameModelState {
    return {
      lives: this._lives,
      remaining: this._animals.length,
      total: this._animals.length,
      state: this._state,
    };
  }
}
