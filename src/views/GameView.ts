import * as PIXI from "pixi.js";

import { AnimalData, Rect } from "../types/GameTypes";
import { AnimalTile } from "./AnimalTile";
import { DropZone } from "./DropZone";
import { HUDView } from "./HUDView";
import { OverlayView } from "./OverlayView";
import { TutorialView } from "./TutorialView";

export interface IGameView {
  onAnimalDropped: (id: string, shape: "round" | "square") => void;
  onRestart: () => void;
  createTiles(
    animals: ReadonlyArray<AnimalData>,
    textures: Record<string, PIXI.Texture>,
  ): void;
  removeTile(id: string, correct: boolean, cb: () => void): void;
  shakeTile(id: string, cb: () => void): void;
  updateHUD(lives: number): void;
  showOverlay(win: boolean): void;
  hideOverlay(): void;
  showTutorial(): void;
  resize(w: number, h: number): void;
}

export class GameView implements IGameView {
  public onAnimalDropped: (id: string, shape: "round" | "square") => void =
    () => {};
  public onRestart: () => void = () => {};

  private _app: PIXI.Application;

  private _stage: PIXI.Container;

  private _bg: PIXI.Sprite;

  private _playPanel = new PIXI.Graphics();
  private _uiPanel = new PIXI.Graphics();
  private _tileLayer = new PIXI.Container();

  private _hud: HUDView;

  private _circleZone: DropZone;
  private _squareZone: DropZone;

  private _overlay: OverlayView;
  private _tutorial: TutorialView;

  private _tiles: Map<string, AnimalTile> = new Map();

  private _dragging = false;

  private _playZone: Rect = { x: 0, y: 0, width: 0, height: 0 };

  private _tileSize = 80;

  constructor(app: PIXI.Application, bgTexture: PIXI.Texture) {
    this._app = app;
    this._stage = app.stage;
    this._stage.sortableChildren = true;

    this._bg = new PIXI.Sprite(bgTexture);
    this._bg.zIndex = 0;
    this._stage.addChild(this._bg);

    this._playPanel.zIndex = 2;
    this._stage.addChild(this._playPanel);

    this._uiPanel.zIndex = 3;
    this._stage.addChild(this._uiPanel);

    this._circleZone = new DropZone("round");
    this._circleZone.zIndex = 5;
    this._stage.addChild(this._circleZone);

    this._squareZone = new DropZone("square");
    this._squareZone.zIndex = 5;
    this._stage.addChild(this._squareZone);

    this._tileLayer.sortableChildren = true;
    this._tileLayer.zIndex = 10;
    this._stage.addChild(this._tileLayer);

    this._hud = new HUDView();
    this._hud.zIndex = 20;
    this._stage.addChild(this._hud);

    this._tutorial = new TutorialView();
    this._tutorial.zIndex = 90;
    this._tutorial.onStart = () => {};
    this._stage.addChild(this._tutorial);

    this._overlay = new OverlayView();
    this._overlay.zIndex = 100;
    this._overlay.onRestart = () => this.onRestart();
    this._stage.addChild(this._overlay);
  }

  public createTiles(
    animals: ReadonlyArray<AnimalData>,
    textures: Record<string, PIXI.Texture>,
  ): void {
    this._tileLayer.removeChildren();
    this._tiles.clear();

    for (const data of animals) {
      const tex = textures[data.frameKey];
      if (!tex) {
        console.warn(`Missing texture: ${data.frameKey}`);
        continue;
      }
      const tile = new AnimalTile(data, tex);
      tile.onDragStart = () => {
        this._dragging = true;
      };
      tile.onDragEnd = (t) => {
        this._dragging = false;
        this._handleDrop(t);
      };
      this._tileLayer.addChild(tile);
      this._tiles.set(data.id, tile);
    }
    this._layoutTiles();
  }

  private _layoutTiles(): void {
    this._tiles.forEach((t) => t.applyLayout(this._playZone, this._tileSize));
  }

  private _handleDrop(tile: AnimalTile): void {
    const g = tile.getGlobalPosition();

    if (this._circleZone.contains(g.x, g.y)) {
      this.onAnimalDropped(tile.animalId, "round");
    } 
    else if (this._squareZone.contains(g.x, g.y)) {
      this.onAnimalDropped(tile.animalId, "square");
    } 
    else {
      tile.returnToStart();
    }

    this._circleZone.setHovered(false);
    this._squareZone.setHovered(false);
  }

  public updateDropZoneHighlight(globalX: number, globalY: number): void {
    if (!this._dragging) {
      this._circleZone.setHovered(false);
      this._squareZone.setHovered(false);
      return;
    }

    this._circleZone.setHovered(this._circleZone.contains(globalX, globalY));
    this._squareZone.setHovered(this._squareZone.contains(globalX, globalY));
  }

  public removeTile(id: string, _correct: boolean, cb: () => void): void {
    const tile = this._tiles.get(id);

    if (!tile) {
      cb();
      return;
    }

    tile.playCorrect(() => {
      this._tileLayer.removeChild(tile);
      this._tiles.delete(id);
      cb();
    });
  }

  public shakeTile(id: string, cb: () => void): void {
    const tile = this._tiles.get(id);

    if (!tile) {
      cb();
      return;
    }

    tile.playWrong(cb);
  }

  public updateHUD(lives: number): void {
    this._hud.setLives(lives, true);
  }

  public showOverlay(win: boolean): void {
    this._overlay.show(win, this._app.screen.width, this._app.screen.height);
  }

  public hideOverlay(): void {
    this._overlay.hide();
  }

  public showTutorial(): void {
    this._tutorial.show();
  }

  public resize(w: number, h: number): void {
    this._bg.width = w;
    this._bg.height = h;

    const margin = Math.max(12, w * 0.025);
    const hudBottom = 74;
    const uiHeight = Math.min(170, Math.max(120, h * 0.2));
    const uiTop = h - uiHeight;

    this._playZone = {
      x: margin,
      y: hudBottom,
      width: w - 2 * margin,
      height: Math.max(80, uiTop - hudBottom - 12),
    };
    this._tileSize = Math.max(46, Math.min(92, Math.min(w, h) * 0.13));

    const zoneW = Math.min(w * 0.4, 220);
    const zoneH = Math.min(uiHeight * 0.72, 120);
    const zoneY = uiTop + uiHeight / 2;
    const gap = zoneW / 2 + Math.min(48, w * 0.05);
    this._circleZone.position.set(w / 2 - gap, zoneY);
    this._squareZone.position.set(w / 2 + gap, zoneY);
    this._circleZone.resize(zoneW, zoneH);
    this._squareZone.resize(zoneW, zoneH);

    this._hud.position.set(20, 22);

    this._layoutTiles();

    const fromX = w / 2;
    const fromY = this._playZone.y + this._playZone.height * 0.35;
    this._tutorial.resize(
      w,
      h,
      fromX,
      fromY,
      this._circleZone.x,
      this._circleZone.y,
    );
  }
}
