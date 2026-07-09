import * as PIXI from "pixi.js";

import { GameModel, IGameModel } from "../models/GameModel";
import { GameView, IGameView } from "../views/GameView";
import { DEFAULT_CONFIG, GameConfig } from "../types/GameTypes";

export class GameController {
  private _firstTime = true;
  private _busy = false;

  private _model!: IGameModel;
  private _view: IGameView;

  private _config: GameConfig;

  private _app: PIXI.Application;

  private _textures: Record<string, PIXI.Texture> = {};

  private _roundFrames: string[] = [];
  private _squareFrames: string[] = [];
  

  constructor(
    view: GameView,
    app: PIXI.Application,
    config: GameConfig = DEFAULT_CONFIG,
  ) {
    this._config = config;
    this._view = view;
    this._app = app;

    view.onAnimalDropped = (id, shape) => this._handleDrop(id, shape);
    view.onRestart = () => this._restart();
  }

  public setTextures(textures: Record<string, PIXI.Texture>): void {
    this._textures = textures;
    this._roundFrames = Object.keys(textures).filter((k) =>
      k.startsWith("round_"),
    );
    this._squareFrames = Object.keys(textures).filter((k) =>
      k.startsWith("square_"),
    );
  }

  private _createModel(): IGameModel {
    const model = new GameModel(
      this._config,
      this._app.screen.width,
      this._app.screen.height,
      this._roundFrames,
      this._squareFrames,
    );

    model.onStateChange = (s) => {
      this._view.updateHUD(s.lives);
      if (s.state === "win")
        setTimeout(() => this._view.showOverlay(true), 400);
      if (s.state === "lose")
        setTimeout(() => this._view.showOverlay(false), 400);
    };
    return model;
  }

  public start(): void {
    this._model = this._createModel();

    this._view.hideOverlay();
    this._view.createTiles(this._model.animals, this._textures);
    this._view.updateHUD(this._model.lives);

    if (this._firstTime) {
      this._view.showTutorial();
      this._firstTime = false;
    }
  }

  private _restart(): void {
    this.start();
  }

  private _handleDrop(id: string, targetShape: "round" | "square"): void {
    if (this._busy) return;

    this._busy = true;

    const correct = this._model.placeAnimal(id, targetShape);
    
    if (correct) {
      this._view.removeTile(id, true, () => {
        this._busy = false;
      });
    } else {
      this._view.shakeTile(id, () => {
        this._busy = false;
      });
      this._view.updateHUD(this._model.lives);
    }
  }
}
