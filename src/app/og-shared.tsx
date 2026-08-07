import { ImageResponse } from "next/og";
import { personal } from "@/data/resume";

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";
export const ogAlt = `${personal.name} - ${personal.positioning}`;

export function renderOgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          backgroundColor: "#0b0e14",
          backgroundImage:
            "radial-gradient(ellipse at top, rgba(245,165,36,0.16), transparent 60%)",
          fontFamily: "monospace",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 28,
            color: "#93a0b4",
            marginBottom: 36,
          }}
        >
          <span style={{ color: "#4fd1c5" }}>yash</span>
          <span>@</span>
          <span style={{ color: "#f5a524" }}>portfolio</span>
          <span>:~$ whoami</span>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 68,
            fontWeight: 700,
            color: "#eceef4",
            lineHeight: 1.15,
            marginBottom: 20,
          }}
        >
          {personal.name}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 34,
            fontWeight: 600,
            background:
              "linear-gradient(90deg, #f5a524 0%, #4fd1c5 100%)",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          {personal.positioning}
        </div>
      </div>
    ),
    { ...ogSize }
  );
}
