import * as PIXI from "pixi.js";

import { AnimalShape } from "../types/GameTypes";

export class DropZone extends PIXI.Container {
  public readonly shape: AnimalShape;

  private _bg = new PIXI.Graphics();
  private _icon = new PIXI.Graphics();

  private _label: PIXI.Text;

  private _w = 180;
  private _h = 110;

  private _hovered = false;

  constructor(shape: AnimalShape) {
    super();

    this.shape = shape;

    this.addChild(this._bg);
    this.addChild(this._icon);

    this._label = new PIXI.Text(shape === "round" ? "CIRCLE" : "SQUARE", {
      fontFamily: "Arial Rounded MT Bold, Arial, sans-serif",
      fontSize: 22,
      fontWeight: "bold",
      fill: 0xffffff,
      stroke: 0x00000055,
      strokeThickness: 3,
      letterSpacing: 2,
    });
    this._label.anchor.set(0.5);
    this.addChild(this._label);

    this._redraw();
  }

  public resize(w: number, h: number): void {
    this._w = w;
    this._h = h;
    this._redraw();
  }

  public setHovered(v: boolean): void {
    if (this._hovered === v) return;

    this._hovered = v;
    this.scale.set(v ? 1.06 : 1.0);
    this._redraw();
  }

  public contains(globalX: number, globalY: number): boolean {
    const local = this.toLocal({ x: globalX, y: globalY });

    return Math.abs(local.x) <= this._w / 2 && Math.abs(local.y) <= this._h / 2;
  }

  private _redraw(): void {
    const g = this._bg;
    g.clear();

    const w = this._w,
      h = this._h,
      hw = w / 2,
      hh = h / 2;

    const main = this.shape === "round" ? this._hovered ? 0xffb142 : 0xffa502 : this._hovered ? 0x74b9ff : 0x54a0ff;

    const dark = this.shape === "round" ? 0xe58e00 : 0x2e86de;

    g.beginFill(0x000000, 0.18);
    g.drawRoundedRect(-hw + 5, -hh + 9, w, h, 28);
    g.endFill();

    g.beginFill(dark, 1);
    g.drawRoundedRect(-hw, -hh + 7, w, h, 28);
    g.endFill();

    g.beginFill(main, 1);
    g.drawRoundedRect(-hw, -hh, w, h - 7, 28);
    g.endFill();

    g.lineStyle(4, 0xffffff, 0.95);
    g.drawRoundedRect(-hw, -hh, w, h - 7, 28);

    g.lineStyle(0);
    g.beginFill(0xffffff, 0.22);
    g.drawRoundedRect(-hw + 10, -hh + 9, w - 20, (h - 7) * 0.38, 20);
    g.endFill();


    this._icon.clear();

    const iy = -hh + 30;
    const s = 15;

    this._icon.lineStyle(4, 0xffffff, 1);
    this._icon.beginFill(0xffffff, 0.35);

    if (this.shape === "round"){
      this._icon.drawCircle(0, iy, s);
    } 
    else {
      this._icon.drawRoundedRect(-s, iy - s, s * 2, s * 2, 5);
    } 

    this._icon.endFill();

    this._label.y = (h - 7) / 2 - 22;
  }
}
