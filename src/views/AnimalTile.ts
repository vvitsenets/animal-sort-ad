import * as PIXI from "pixi.js";

import { AnimalData, Rect } from "../types/GameTypes";

export class AnimalTile extends PIXI.Container {
  public readonly animalId: string;
  public readonly shape: "round" | "square";

  public relX: number;
  public relY: number;

  private _sprite: PIXI.Sprite;
  private _glow: PIXI.Graphics;

  private _tileSize = 80;
  private _dragOffsetX = 0;
  private _dragOffsetY = 0;
  private _startX = 0;
  private _startY = 0;

  private _isDragging = false;
  private _isHover = false;

  public onDragStart?: (tile: AnimalTile) => void;
  public onDragEnd?: (tile: AnimalTile) => void;

  constructor(data: AnimalData, texture: PIXI.Texture) {
    super();

    this.animalId = data.id;
    this.shape = data.shape;

    this.relX = data.x;
    this.relY = data.y;

    this._glow = new PIXI.Graphics();
    this.addChild(this._glow);

    this._sprite = new PIXI.Sprite(texture);
    this._sprite.anchor.set(0.5);
    this.addChild(this._sprite);

    this._setupInteractivity();
  }

  public applyLayout(zone: Rect, tileSize: number): void {
    this._tileSize = tileSize;

    this._sprite.width = tileSize;
    this._sprite.height = tileSize;

    this.x = zone.x + this.relX * zone.width;
    this.y = zone.y + this.relY * zone.height;
    this._startX = this.x;
    this._startY = this.y;
    this._drawGlow(this._isHover);
  }

  private _setupInteractivity(): void {
    this.eventMode = "static";
    this.cursor = "grab";

    this.on("pointerover", this._onOver, this);
    this.on("pointerout", this._onOut, this);
    this.on("pointerdown", this._onDown, this);
    this.on("globalpointermove", this._onMove, this);
    this.on("pointerup", this._onUp, this);
    this.on("pointerupoutside", this._onUp, this);
  }

  private _onOver(): void {
    if (this._isDragging) return;

    this._isHover = true;
    this.scale.set(1.12);
    this._drawGlow(true);
  }

  private _onOut(): void {
    if (this._isDragging) return;

    this._isHover = false;
    this.scale.set(1.0);
    this._drawGlow(false);
  }

  private _onDown(e: PIXI.FederatedPointerEvent): void {
    this._isDragging = true;
    this._isHover = false;

    this.scale.set(1.12);

    const local = this.parent.toLocal(e.global);

    this._dragOffsetX = local.x - this.x;
    this._dragOffsetY = local.y - this.y;

    this.zIndex = 999;
    this.cursor = "grabbing";

    this._drawGlow(true);
    this.onDragStart?.(this);
    e.stopPropagation();
  }

  private _onMove(e: PIXI.FederatedPointerEvent): void {
    if (!this._isDragging) return;

    const local = this.parent.toLocal(e.global);

    this.x = local.x - this._dragOffsetX;
    this.y = local.y - this._dragOffsetY;
  }

  private _onUp(): void {
    if (!this._isDragging) return;

    this._isDragging = false;
    this.scale.set(1.0);
    this.cursor = "grab";

    this._drawGlow(false);
    this.onDragEnd?.(this);
  }

  public returnToStart(): void {
    this._drawGlow(false);

    this.scale.set(1.0);

    const tx = this._startX;
    const ty = this._startY;

    const ticker = PIXI.Ticker.shared;

    const step = () => {
      const dx = tx - this.x;
      const dy = ty - this.y;

      if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) {
        this.x = tx;
        this.y = ty;
        ticker.remove(step);
        return;
      }

      this.x += dx * 0.2;
      this.y += dy * 0.2;
    };

    ticker.add(step);
  }

  public playCorrect(onDone: () => void): void {
    this._drawGlow(false);

    let t = 0;

    const ticker = PIXI.Ticker.shared;

    const step = () => {
      t += 0.08;
      this.alpha = 1 - t;
      this.scale.set(1 + t * 0.6);
      if (t >= 1) {
        ticker.remove(step);
        onDone();
      }
    };

    ticker.add(step);
  }

  public playWrong(onDone: () => void): void {
    this._drawGlow(false);

    this.scale.set(1.0);

    const ox = this.x;

    let t = 0;

    const ticker = PIXI.Ticker.shared;

    const step = () => {
      t += 0.15;
      this.x = ox + Math.sin(t * Math.PI * 6) * 12;
      if (t >= 1) {
        this.x = ox;
        ticker.remove(step);
        this.returnToStart();
        onDone();
      }
    };

    ticker.add(step);
  }

  private _drawGlow(active: boolean): void {
    this._glow.clear();

    if (!active) return;

    const color = this.shape === "round" ? 0xffdd44 : 0x44ddff;
    const r = this._tileSize * 0.62;

    this._glow.lineStyle(5, color, 0.9);
    if (this.shape === "round"){
      this._glow.drawCircle(0, 0, r);
    } 
    else{
      this._glow.drawRoundedRect(-r, -r, r * 2, r * 2, 10);
    } 
     
    const r2 = r + 8;

    this._glow.lineStyle(3, color, 0.35);

    if (this.shape === "round"){
      this._glow.drawCircle(0, 0, r2);
    } 
    else{
      this._glow.drawRoundedRect(-r2, -r2, r2 * 2, r2 * 2, 12);
    } 
  }
}
