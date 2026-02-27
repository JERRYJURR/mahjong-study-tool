/**
 * Extract individual tile SVGs from the panel.color.svg
 * Reads the panel, finds each <g id="tilename"> block, and writes
 * individual SVG files using our tile notation (1m, 5p, 0s, etc.)
 */
import { readFileSync, writeFileSync, mkdirSync } from "fs";

// Mapping: repo tile ID → our notation
const TILE_MAP = {
  // Manzu
  "1man": "1m", "2man": "2m", "3man": "3m", "4man": "4m", "5man": "5m",
  "6man": "6m", "7man": "7m", "8man": "8m", "9man": "9m",
  // Pinzu
  "1pin": "1p", "2pin": "2p", "3pin": "3p", "4pin": "4p", "5pin": "5p",
  "6pin": "6p", "7pin": "7p", "8pin": "8p", "9pin": "9p",
  // Souzu
  "1sou": "1s", "2sou": "2s", "3sou": "3s", "4sou": "4s", "5sou": "5s",
  "6sou": "6s", "7sou": "7s", "8sou": "8s", "9sou": "9s",
  // Honors (winds + dragons)
  "ton": "1z",   // East
  "nan": "2z",   // South
  "xia": "3z",   // West
  "pei": "4z",   // North
  "haku": "5z",  // White dragon
  "hatsu": "6z", // Green dragon
  "chun": "7z",  // Red dragon
  // Red fives
  "aka5man": "0m",
  "aka5pin": "0p",
  "aka5sou": "0s",
  // Special
  "back": "back",
};

// The shared <defs> block from the panel (color gradients)
const DEFS = `  <defs>
    <linearGradient id="tileblack"><stop style="stop-color:#000000"/></linearGradient>
    <linearGradient id="tileblue"><stop style="stop-color:#000040"/></linearGradient>
    <linearGradient id="tilered"><stop style="stop-color:#800000"/></linearGradient>
    <linearGradient id="tilebrred"><stop style="stop-color:#C00000"/></linearGradient>
    <linearGradient id="tilegreen"><stop style="stop-color:#004000"/></linearGradient>
    <linearGradient id="tileface"><stop style="stop-color:#fefbe6"/></linearGradient>
    <linearGradient id="tileframe"><stop style="stop-color:#000000"/></linearGradient>
    <linearGradient id="tileback"><stop style="stop-color:#e6a80f"/></linearGradient>
  </defs>`;

const TILE_WIDTH = 490;
const TILE_HEIGHT = 670;

const panelPath = "/tmp/mahjong-tiles-repo/vector/tileset2/panel.color.svg";
const outputDir = process.cwd() + "/public/tiles";

mkdirSync(outputDir, { recursive: true });

const svg = readFileSync(panelPath, "utf-8");

let extracted = 0;
let skipped = 0;

for (const [repoId, notation] of Object.entries(TILE_MAP)) {
  // Find the <g id="repoId" ...> block
  // We need to find the opening tag and its matching closing </g>
  const openPattern = new RegExp(`<g\\s[^>]*id="${repoId}"[^>]*>`, "s");
  const openMatch = svg.match(openPattern);

  if (!openMatch) {
    console.log(`WARNING: Could not find tile group: ${repoId}`);
    skipped++;
    continue;
  }

  const startIdx = openMatch.index;

  // Find the matching closing </g> by counting nesting
  let depth = 1;
  let searchIdx = startIdx + openMatch[0].length;

  while (depth > 0 && searchIdx < svg.length) {
    const nextOpen = svg.indexOf("<g", searchIdx);
    const nextClose = svg.indexOf("</g>", searchIdx);

    if (nextClose === -1) break;

    if (nextOpen !== -1 && nextOpen < nextClose) {
      depth++;
      searchIdx = nextOpen + 2;
    } else {
      depth--;
      if (depth === 0) {
        const endIdx = nextClose + 4; // "</g>".length
        const groupContent = svg.substring(startIdx, endIdx);

        // Extract the transform to remove the panel positioning
        const transformMatch = groupContent.match(/transform="translate\(([^)]+)\)"/);

        // Get inner content (everything inside the <g>...</g>)
        const innerStart = groupContent.indexOf(">") + 1;
        const innerEnd = groupContent.lastIndexOf("</g>");
        const innerContent = groupContent.substring(innerStart, innerEnd);

        // Write individual SVG file with explicit dimensions for <img> compatibility
        const tileSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${TILE_WIDTH}" height="${TILE_HEIGHT}" viewBox="0 0 ${TILE_WIDTH} ${TILE_HEIGHT}">
${DEFS}
  <g>
${innerContent}
  </g>
</svg>`;

        const outPath = `${outputDir}/${notation}.svg`;
        writeFileSync(outPath, tileSvg);
        console.log(`✓ ${repoId} → ${notation}.svg`);
        extracted++;
      } else {
        searchIdx = nextClose + 4;
      }
    }
  }
}

console.log(`\nDone: ${extracted} tiles extracted, ${skipped} skipped.`);
