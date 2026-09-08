// One-off generator for assets/favicon/*. Not part of the normal build; run manually
// when the icon design changes:
//   npm install sharp to-ico --no-save
//   node build/gen-favicon.mjs
//
// Renders a simplified, bold version of the header brand-mark (Views/Shared/_TopNavigation.cshtml)
// at favicon sizes -- the full detailed SVG (continents, solar panels) turns to mud below ~48px,
// so this drops to one earth blob + one satellite dot in the same brand colors. js/app.js's
// initializeAnimatedFavicon() reuses this exact geometry client-side to animate the tab icon.
import sharp from "sharp";
import { writeFile } from "node:fs/promises";
import toIco from "to-ico";

const OUT_DIR = new URL("../assets/favicon/", import.meta.url);

function buildSvg({ angleDeg = -20 } = {}) {
  const rx = 40;
  const ry = 18;
  const tiltDeg = -20;
  const tiltRad = (tiltDeg * Math.PI) / 180;
  const rad = (angleDeg * Math.PI) / 180;
  const ex = rx * Math.cos(rad);
  const ey = ry * Math.sin(rad);
  const sx = 50 + ex * Math.cos(tiltRad) - ey * Math.sin(tiltRad);
  const sy = 50 + ex * Math.sin(tiltRad) + ey * Math.cos(tiltRad);
  const behind = Math.sin(rad) > 0.2;
  const satellite = `<circle cx="${sx.toFixed(2)}" cy="${sy.toFixed(2)}" r="${behind ? 6 : 8}" fill="${behind ? "#3d8f68" : "#6ce5b1"}"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="49" fill="#08111f"/>
  <ellipse cx="50" cy="50" rx="${rx}" ry="${ry}" transform="rotate(${tiltDeg} 50 50)" fill="none" stroke="#79a8ff" stroke-opacity="0.55" stroke-width="3"/>
  ${behind ? satellite : ""}
  <circle cx="50" cy="50" r="26" fill="#79a8ff"/>
  <path d="M34 34c6-6 14-6 18-1 4 5 0 11-7 12-8 1-15-6-11-11z" fill="#6ce5b1"/>
  ${!behind ? satellite : ""}
</svg>`;
}

async function renderPng(size, filename) {
  const buffer = await sharp(Buffer.from(buildSvg())).resize(size, size).png().toBuffer();
  await writeFile(new URL(filename, OUT_DIR), buffer);
  console.log("wrote", filename, size);
  return buffer;
}

async function main() {
  const png16 = await renderPng(16, "favicon-16x16.png");
  const png32 = await renderPng(32, "favicon-32x32.png");
  await renderPng(180, "apple-touch-icon.png");
  await renderPng(192, "android-chrome-192x192.png");
  await renderPng(512, "android-chrome-512x512.png");

  const png48 = await sharp(Buffer.from(buildSvg())).resize(48, 48).png().toBuffer();
  const ico = await toIco([png16, png32, png48]);
  await writeFile(new URL("favicon.ico", OUT_DIR), ico);
  console.log("wrote favicon.ico");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
