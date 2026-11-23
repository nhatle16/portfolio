import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// Link preview for LinkedIn, X, Slack etc. Next.js adds the og:image tags for it.
export const alt = "Minh Nhat (Nolan) Le, Computer Science student building AI-powered software";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const photo = await readFile(join(process.cwd(), "public/picture.jpg"));
  const src = `data:image/jpeg;base64,${photo.toString("base64")}`;

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
            <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.05, color: "#171717" }}>Minh Nhat (Nolan) Le</div>
            <div style={{ fontSize: 34, lineHeight: 1.3, color: "#404040" }}>
              Computer Science student at the University of Saskatchewan, building AI-powered software.
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#171717" }}>minhnhatle.vercel.app</div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
