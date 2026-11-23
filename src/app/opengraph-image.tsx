import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// Link preview for LinkedIn, X, Slack etc. Next.js adds the og:image tags for it.
export const alt = "Minh Nhat (Nolan) Le, Computer Science student building AI-powered software";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const NAME = "Minh Nhat (Nolan) Le";
const TAGLINE = "Computer Science student at the University of Saskatchewan, building AI-powered software.";
const URL_TEXT = "minhnhatle.vercel.app";

// ImageResponse can't use next/font, so fetch the site's fonts as TTF from Google Fonts (only the glyphs in `text`).
async function googleFont(family: string, weight: number, text: string) {
  const css = await (
    await fetch(`https://fonts.googleapis.com/css2?family=${family}:wght@${weight}&text=${encodeURIComponent(text)}`)
  ).text();
  const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
  if (!url) throw new Error(`Could not load font ${family}`);
  return (await fetch(url)).arrayBuffer();
}

export default async function Image() {
  const photo = await readFile(join(process.cwd(), "public/picture.jpg"));
  const src = `data:image/jpeg;base64,${photo.toString("base64")}`;

  const [grotesk, garamond] = await Promise.all([
    googleFont("Space+Grotesk", 700, NAME + URL_TEXT),
    googleFont("EB+Garamond", 500, TAGLINE),
  ]);

  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", padding: 48, background: "#ffffff" }}>
        {/* Neobrutalist card: thick black border and a hard offset shadow, like the site's cards. */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 56,
            width: "100%",
            height: "100%",
            padding: 48,
            border: "4px solid #000",
            boxShadow: "12px 12px 0 0 #000",
            background: "linear-gradient(to bottom right, #f9fcff, #f1f5fe)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse only renders plain img */}
          <img src={src} alt="" width={330} height={440} style={{ objectFit: "cover", border: "4px solid #000" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 24, flex: 1 }}>
            <div style={{ fontFamily: "Space Grotesk", fontSize: 56, fontWeight: 700, lineHeight: 1.05, color: "#171717" }}>{NAME}</div>
            <div style={{ fontFamily: "EB Garamond", fontSize: 38, fontWeight: 500, lineHeight: 1.3, color: "#262626" }}>{TAGLINE}</div>
            <div style={{ fontFamily: "Space Grotesk", fontSize: 28, fontWeight: 700, color: "#171717" }}>{URL_TEXT}</div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Space Grotesk", data: grotesk, weight: 700, style: "normal" },
        { name: "EB Garamond", data: garamond, weight: 500, style: "normal" },
      ],
    },
  );
}
