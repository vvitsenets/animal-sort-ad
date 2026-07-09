import * as PIXI from "pixi.js";

export async function loadSparrowAtlas(
  pngUrl: string,
  xmlUrl: string,
): Promise<Record<string, PIXI.Texture>> {
  const baseTexture = await PIXI.Assets.load<PIXI.Texture>(pngUrl);

  const xmlText = await (await fetch(xmlUrl)).text();
  const doc = new DOMParser().parseFromString(xmlText, "text/xml");

  const textures: Record<string, PIXI.Texture> = {};
  doc.querySelectorAll("SubTexture").forEach((sub) => {
    const rawName = sub.getAttribute("name") ?? "";
    const name = rawName.replace(/\.png$/i, "");
    const x = parseInt(sub.getAttribute("x") ?? "0", 10);
    const y = parseInt(sub.getAttribute("y") ?? "0", 10);
    const w = parseInt(sub.getAttribute("width") ?? "0", 10);
    const h = parseInt(sub.getAttribute("height") ?? "0", 10);

    const frame = new PIXI.Rectangle(x, y, w, h);
    textures[name] = new PIXI.Texture(baseTexture.baseTexture, frame);
  });

  return textures;
}
