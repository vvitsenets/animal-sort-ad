import * as PIXI from "pixi.js";

const easeInOut = (t: number) =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

export class TutorialView extends PIXI.Container {
  private _bg = new PIXI.Graphics();
  private _demo = new PIXI.Container();
  private _demoTile = new PIXI.Graphics();
  private _hand = new PIXI.Graphics();

  private _title: PIXI.Text;
  private _sub: PIXI.Text;
  private _tap: PIXI.Text;
  
  private _fromX = 0;
  private _fromY = 0;
  private _toX = 0;
  private _toY = 0;
  private _t = 0;

  private _running = false;

  public onStart?: () => void;

  constructor() {
    super();

    this.visible = false;

    this.addChild(this._bg);

    // Graphics was created using an AI prompt
    this._demoTile.beginFill(0xffd54f);
    this._demoTile.lineStyle(4, 0xffffff, 1);
    this._demoTile.drawCircle(0, 0, 34);
    this._demoTile.endFill();
    this._demo.addChild(this._demoTile);

    this._hand.beginFill(0xffffff, 0.95);
    this._hand.lineStyle(3, 0x555555, 0.6);
    this._hand.drawCircle(24, 24, 15);
    this._hand.endFill();
    this._demo.addChild(this._hand);
    this.addChild(this._demo);

    this._title = this._mkText("Sort the Animals!", 40, 0xffffff);
    this._sub = this._mkText(
      "Drag each animal onto the matching shape",
      22,
      0xfff5e0,
    );
    this._tap = this._mkText("▶  Tap to Play", 26, 0xffe66d);
    this.addChild(this._title, this._sub, this._tap);

    this.eventMode = "static";
    this.on("pointerdown", () => this._start());

    PIXI.Ticker.shared.add(this._tick, this);
  }

  private _mkText(s: string, size: number, fill: number): PIXI.Text {
    const t = new PIXI.Text(s, {
      fontFamily: "Arial Rounded MT Bold, Arial, sans-serif",
      fontSize: size,
      fontWeight: "bold",
      fill,
      stroke: 0x00000060,
      strokeThickness: 4,
      align: "center",
    });
    t.anchor.set(0.5);

    return t;
  }

  public resize(
    w: number,
    h: number,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
  ): void {
    this._bg.clear();
    this._bg.beginFill(0x1e2a3a, 0.62);
    this._bg.drawRect(0, 0, w, h);
    this._bg.endFill();

    this._title.position.set(w / 2, h * 0.16);
    this._sub.position.set(w / 2, h * 0.16 + 44);
    this._tap.position.set(w / 2, h * 0.86);

    this._fromX = fromX;
    this._fromY = fromY;
    this._toX = toX;
    this._toY = toY;
  }

  public show(): void {
    this.visible = true;
    this._running = true;
    this._t = 0;
  }

  private _start(): void {
    this.visible = false;
    this._running = false;
    this.onStart?.();
  }

  private _tick(): void {
    if (!this._running || !this.visible) return;

    this._t += 1 / 60 / 2.2;

    const p = this._t % 1;
    const moveP = Math.min(p / 0.75, 1);
    const e = easeInOut(moveP);

    this._demo.x = this._fromX + (this._toX - this._fromX) * e;
    this._demo.y = this._fromY + (this._toY - this._fromY) * e;
    this._demo.alpha = p > 0.9 ? 1 - (p - 0.9) / 0.1 : 1;
    
    this._tap.scale.set(1 + Math.sin(this._t * Math.PI * 4) * 0.06);
  }
}
