import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// Artwork follows the original "Ruhiger Rhythmus" study. The redundant
// backtracking on the G crossbar and R stem is removed without altering the
// visible geometry. Each export is a standalone file with no remote resources.
const root = dirname(fileURLToPath(import.meta.url));
const out = join(root, "export");
const font = readFileSync(join(root, "source", "DM-Sans-Bold.ttf")).toString("base64");
const mark = `M91 20 C82 12 70 9 58 11 C36 14 20 32 19 54 C17 78 34 96 57 98 C78 100 94 86 98 69 C100 63 100 58 98 53 H130 V18 H165 C183 18 194 28 194 43 C194 58 183 68 165 68 H130 V99 M98 53 H75 M130 68 L181 101`;
const gOnly = `M91 20 C82 12 70 9 58 11 C36 14 20 32 19 54 C17 78 34 96 57 98 C78 100 94 86 98 69 C100 63 100 58 98 53 H110 M98 53 H75`;
const svg = (viewBox, body) => `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="${viewBox}">${body}</svg>\n`;
const stroke = (d, color, width = 9) => `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`;
const dark = "#263e38";
const white = "#ffffff";
const scratch = mkdtempSync(join(tmpdir(), "gr-3b1-"));
mkdirSync(out, { recursive: true });

try {
  for (const [name, color] of [["zeichen-dunkel", dark], ["zeichen-weiss", white], ["zeichen-schwarz", "#000000"]]) {
    writeFileSync(join(out, `${name}.svg`), svg("0 0 215 116", stroke(mark, color)));
  }
  // At 16px the wide GR loses its interior details. Use the G alone for
  // the square app/browser icon; the complete GR is kept for larger uses.
  const favicon = svg("0 0 116 116",
    `<rect width="116" height="116" rx="23" fill="${dark}"/>${stroke(gOnly, white, 10)}`);
  writeFileSync(join(out, "favicon.svg"), favicon);

  for (const [name, foreground] of [["wort-bild-dunkel", dark], ["wort-bild-weiss", white]]) {
    const html = `<!doctype html><html><head><meta charset="utf-8"><style>
      @font-face{font-family:DM;src:url(data:font/ttf;base64,${font}) format("truetype");font-weight:700}
      @page{size:330px 100px;margin:0}*{box-sizing:border-box}
      html,body{margin:0;width:330px;height:100px;background:transparent}
      .name{position:absolute;left:97px;top:30px;font:700 31px/1 DM,Arial,sans-serif;letter-spacing:-1.1px;color:${foreground}}
      .sub{position:absolute;left:98px;top:68px;font:9px/1 "DejaVu Sans Mono",monospace;letter-spacing:0;white-space:nowrap;color:${foreground}}
    </style></head><body><div class="name">germring.de</div><div class="sub">FÜRSTENFELDBRUCK · ENERGIE &amp; ZUKUNFT</div></body></html>`;
    const htmlPath = join(scratch, `${name}.html`);
    const pdfPath = join(scratch, `${name}.pdf`);
    const textSvgPath = join(scratch, `${name}.svg`);
    writeFileSync(htmlPath, html);
    execFileSync("chromium", [
      "--headless", "--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage",
      "--no-pdf-header-footer", "--virtual-time-budget=1500",
      `--print-to-pdf=${pdfPath}`, `file://${htmlPath}`
    ], { stdio: "ignore" });
    execFileSync("pdftocairo", ["-svg", pdfPath, textSvgPath]);
    const outlined = readFileSync(textSvgPath, "utf8");
    const textShapes = outlined.match(/<\/defs>([\s\S]*?)<\/svg>/)?.[1];
    if (!textShapes || !textShapes.includes("<use ")) throw new Error("Text outline export failed");
    const glyphs = new Map([...outlined.matchAll(/<g id="(glyph-[^"]+)">([\s\S]*?)<\/g>/g)]
      .map((match) => [match[1], match[2]]));
    let glyphCount = 0;
    const expanded = textShapes.replace(
      /<use xlink:href="#(glyph-[^"]+)" x="([^"]+)" y="([^"]+)"\/>/g,
      (_, key, x, y) => {
        const paths = glyphs.get(key);
        if (!paths) throw new Error(`Missing outlined glyph ${key}`);
        glyphCount++;
        return `<g transform="translate(${x} ${y})">${paths}</g>`;
      }
    );
    if (glyphCount < 20 || expanded.includes("<use ")) throw new Error("Incomplete text outline export");
    const lockup = svg("0 0 330 100",
      `<g transform="scale(1.3333333333)">${expanded}</g><g transform="translate(8 32) scale(.36)">${stroke(mark, foreground)}</g>`);
    writeFileSync(join(out, `${name}.svg`), lockup);
  }

  for (const size of [1024, 512]) {
    execFileSync("magick", ["-background", "none", join(out, "zeichen-dunkel.svg"), "-resize", `${size}x`, `PNG32:${join(out, `zeichen-dunkel-${size}.png`)}`]);
  }
  // Chromium respects the converted font outlines; ImageMagick's SVG renderer
  // does not position these glyph paths consistently across versions.
  for (const size of [1320, 660]) {
    execFileSync("chromium", [
      "--headless", "--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage",
      "--default-background-color=00000000", `--window-size=${size},${Math.round(size * 100 / 330)}`,
      `--screenshot=${join(out, `wort-bild-dunkel-${size}.png`)}`,
      `file://${join(out, "wort-bild-dunkel.svg")}`
    ], { stdio: "ignore" });
  }
  for (const size of [16, 32, 48, 180, 512]) {
    execFileSync("magick", ["-background", "none", join(out, "favicon.svg"), "-resize", `${size}x${size}`, `PNG32:${join(out, `favicon-${size}.png`)}`]);
  }
  execFileSync("magick", [join(out, "favicon-16.png"), join(out, "favicon-32.png"), join(out, "favicon-48.png"), join(out, "favicon.ico")]);
  console.log(`Exported GR 3B1 assets to ${out}`);
} finally {
  rmSync(scratch, { recursive: true, force: true });
}