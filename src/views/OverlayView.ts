import * as PIXI from "pixi.js";

export class OverlayView extends PIXI.Container {
  private _bg: PIXI.Graphics;
  private _btn: PIXI.Graphics;

  private _title: PIXI.Text;
  private _sub: PIXI.Text;
  private _btnLabel: PIXI.Text;

  public onRestart?: () => void;

  constructor() {
    super();
    this.visible = false;

    this._bg = new PIXI.Graphics();
    this.addChild(this._bg);

    this._title = new PIXI.Text("", {
      fontFamily: "Georgia, serif",
      fontSize: 48,
      fontWeight: "bold",
      fill: 0xffffff,
      stroke: 0x00000060,
      strokeThickness: 6,
      align: "center",
    });
    this._title.anchor.set(0.5);
    this.addChild(this._title);

    this._sub = new PIXI.Text("", {
      fontFamily: "Georgia, serif",
      fontSize: 22,
      fill: 0xfff5e0,
      align: "center",
    });
    this._sub.anchor.set(0.5);
    this.addChild(this._sub);

    this._btn = new PIXI.Graphics();
    this._btn.eventMode = "static";
    this._btn.cursor = "pointer";
    this._btn.on("pointerdown", () => this.onRestart?.());
    this.addChild(this._btn);

    this._btnLabel = new PIXI.Text("Play Again", {
      fontFamily: "Georgia, serif",
      fontSize: 20,
      fontWeight: "bold",
      fill: 0xffffff,
    });
    this._btnLabel.anchor.set(0.5);
    this.addChild(this._btnLabel);
  }

  public show(win: boolean, stageW: number, stageH: number): void {
    this.visible = true;

    this._bg.clear();
    this._bg.beginFill(win ? 0x2ecc71 : 0xe74c3c, 0.82);
    this._bg.drawRoundedRect(-stageW / 2, -stageH / 2, stageW, stageH, 0);
    this._bg.endFill();

    this._title.text = win ? "You Win!" : "Game Over";
    this._sub.text = win ? "All animals sorted correctly!" : "No more lives remaining.";

    this.position.set(stageW / 2, stageH / 2);
    this._title.y = -60;
    this._sub.y = 10;

    this._btn.clear();
    this._btn.beginFill(0xffffff, 0.9);
    this._btn.drawRoundedRect(-80, -22, 160, 44, 22);
    this._btn.endFill();
    this._btn.y = 70;
    this._btnLabel.y = 70;
    this._btnLabel.style.fill = win ? 0x27ae60 : 0xc0392b;
  }

  public hide(): void {
    this.visible = false;
  }
}
