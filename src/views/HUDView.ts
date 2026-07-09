import * as PIXI from "pixi.js";

export class HUDView extends PIXI.Container {
  private _cloud = new PIXI.Graphics();
  private _heart = new PIXI.Graphics();
  private _numBg = new PIXI.Graphics();

  private _livesText: PIXI.Text;

  constructor() {
    super();

    this.addChild(this._cloud);
    this.addChild(this._heart);
    this.addChild(this._numBg);

    this._livesText = new PIXI.Text("5", {
      fontFamily: "Arial Rounded MT Bold, Arial, sans-serif",
      fontSize: 24,
      fontWeight: "bold",
      fill: 0xe74c3c,
    });
    this._livesText.anchor.set(0.5);
    this.addChild(this._livesText);

    this._drawCloud();
    this._drawHeart(false);
    this._drawNumBg();
    this.setLives(5);
  }

  public setLives(lives: number, flash = false): void {
    this._livesText.text = `${lives}`;
    this._livesText.x = 56;
    this._livesText.y = 0;

    if (flash) {
      this._drawHeart(true);
      setTimeout(() => this._drawHeart(false), 300);
    }
  }

  private _drawNumBg(): void {
    const g = this._numBg;

    g.clear();
    g.beginFill(0xffffff, 0.97);
    g.lineStyle(3, 0xffd0d0, 1);
    g.drawRoundedRect(39, -16, 34, 32, 11);
    g.endFill();
  }

  private _drawCloud(): void {
    const g = this._cloud;

    g.clear();
    g.beginFill(0xffffff, 0.95);
    g.drawEllipse(35, 0, 62, 24);
    g.drawCircle(12, -10, 16);
    g.drawCircle(38, -16, 21);
    g.drawCircle(64, -8, 15);
    g.endFill();
    g.beginFill(0xdde8ee, 0.4);
    g.drawEllipse(38, 6, 56, 11);
    g.endFill();
  }

  private _drawHeart(flash: boolean): void {
    const g = this._heart;
    g.clear();

    const color = flash ? 0xff4444 : 0xff6b6b;
    g.beginFill(color);

    // Heart drawn with bezier curves using AI prompt
    g.moveTo(-14, -2);
    g.bezierCurveTo(-14, -10, -6, -14, 0, -8);
    g.bezierCurveTo(6, -14, 14, -10, 14, -2);
    g.bezierCurveTo(14, 4, 6, 12, 0, 18);
    g.bezierCurveTo(-6, 12, -14, 4, -14, -2);
    g.endFill();
    g.x = 18;
    g.y = -3;
  }
}
