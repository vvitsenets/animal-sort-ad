import * as PIXI from "pixi.js";

import { GameView } from "./views/GameView";
import { GameController } from "./controllers/GameController";
import { DEFAULT_CONFIG } from "./types/GameTypes";
import { loadSparrowAtlas } from "./utils/loadAtlas";

async function bootstrap(): Promise<void> {
  const app = new PIXI.Application({
    resizeTo: window,
    backgroundColor: 0x87ceeb,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
    antialias: true,
  });

  document.body.appendChild(app.view as HTMLCanvasElement);

  const bgTexture = await PIXI.Assets.load<PIXI.Texture>(
    "/assets/background.png",
  );

  const roundTex = await loadSparrowAtlas(
    "/assets/round_nodetailsOutline.png",
    "/assets/round_nodetailsOutline.xml",
  );

  const squareTex = await loadSparrowAtlas(
    "/assets/square_nodetailsOutline.png",
    "/assets/square_nodetailsOutline.xml",
  );

  const textures: Record<string, PIXI.Texture> = {};
  for (const [name, tex] of Object.entries(roundTex))
    textures[`round_${name}`] = tex;
  for (const [name, tex] of Object.entries(squareTex))
    textures[`square_${name}`] = tex;

  const view = new GameView(app, bgTexture);

  const controller = new GameController(view, app, DEFAULT_CONFIG);
  controller.setTextures(textures);

  view.resize(app.screen.width, app.screen.height);
  controller.start();

  window.addEventListener("resize", () => {
    view.resize(app.screen.width, app.screen.height);
  });

  app.stage.eventMode = "static";
  app.stage.on("globalpointermove", (e: PIXI.FederatedPointerEvent) => {
    (view as any).updateDropZoneHighlight(e.global.x, e.global.y);
  });
}

bootstrap().catch(console.error);