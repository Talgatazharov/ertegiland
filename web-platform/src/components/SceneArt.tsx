import { useId } from "react";
import type { Scene } from "../types";
const palettes: Record<Scene, [string, string, string]> = {
  steppe: ["#122e49", "#5f8d88", "#c1a168"],
  forest: ["#143d38", "#578e77", "#bacb8b"],
  mountain: ["#243d61", "#94b2c6", "#d4dfea"],
  village: ["#623e47", "#b48472", "#ead0a0"],
  garden: ["#354f53", "#8cac86", "#e9d4a5"],
  sky: ["#141d46", "#49577e", "#dfc988"],
  court: ["#25394c", "#6f8790", "#c8ac78"],
};
export const sceneNames: Record<Scene, string> = {
  steppe: "Жұлдызды дала",
  forest: "Сырлы орман",
  mountain: "Көгілдір асу",
  village: "Жылы ауыл",
  garden: "Сиқырлы бақ",
  sky: "Жұлдыздар әлемі",
  court: "Даналық сарайы",
};
export function SceneArt({
  scene = "steppe",
  className = "",
}: {
  scene?: Scene;
  className?: string;
}) {
  const id = useId().replaceAll(":", "");
  const colors = palettes[scene];
  return (
    <svg
      className={"scene-art " + className}
      viewBox="0 0 900 340"
      role="img"
      aria-label={sceneNames[scene]}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id={id} x2="0" y2="1">
          <stop stopColor={colors[0]} />
          <stop offset="1" stopColor={colors[1]} />
        </linearGradient>
      </defs>
      <rect width="900" height="340" fill={"url(#" + id + ")"} />
      <circle cx="690" cy="73" r="35" fill={colors[2]} />
      <g fill="#f5e6b9" opacity=".75">
        {[70, 160, 280, 420, 530, 790, 850].map((x, i) => (
          <circle key={x} cx={x} cy={35 + (i % 3) * 30} r={i % 2 ? 2 : 1.5} />
        ))}
      </g>
      <path
        d="m0 230 128-128 151 157 169-179 166 164 149-119 137 105v110H0"
        fill={colors[1]}
      />
      <path
        d="m128 102-45 50 38-13 20 15 12-11 28 15m267-78-61 73 57-20 39 29-4-31 33 22"
        fill={colors[2]}
        opacity=".65"
      />
      <path
        d="M0 282q180-82 380-20t520-30v108H0"
        fill={colors[0]}
        opacity=".7"
      />
      <path
        d="M516 226q-65 29-10 54t-26 60H350q123-45 108-69t58-45"
        fill={colors[2]}
        opacity=".65"
      />
      {(scene === "forest" || scene === "garden") && (
        <g fill={colors[0]}>
          {[90, 165, 750, 825].map((x, i) => (
            <g
              key={x}
              transform={"translate(" + x + " " + (120 + (i % 2) * 30) + ")"}
            >
              <path d="m0 0-43 95h24l-33 54h41v44h20v-44h41l-33-54h24z" />
            </g>
          ))}
        </g>
      )}
      {(scene === "village" || scene === "steppe") && (
        <g transform="translate(160 193)">
          <path d="M0 48q80-93 160 0v66H0z" fill="#ecd5a0" />
          <path
            d="M0 48q80-32 160 0M5 91h150"
            stroke="#a78151"
            fill="none"
            strokeWidth="7"
          />
          <path d="M66 114V66h29v48" fill="#544741" />
        </g>
      )}
      {scene === "court" && (
        <g fill="#c8ac78" stroke="#e7d7a2" strokeWidth="3">
          <path d="M170 290V151h172v139m-192-139 108-60 103 60z" />
          <path d="M195 290V165m35 125V165m54 125V165m32 125V165" />
        </g>
      )}
      {scene === "sky" && (
        <g fill="none" stroke="#d9c99b" opacity=".65">
          <ellipse
            cx="300"
            cy="155"
            rx="88"
            ry="21"
            transform="rotate(-20 300 155)"
          />
          <circle cx="300" cy="155" r="46" />
        </g>
      )}
      <g fill="#e8d595">
        <path d="m568 120 5 16 15 5-15 5-5 16-5-16-15-5 15-5" />
        <circle cx="411" cy="217" r="3" />
        <circle cx="526" cy="290" r="2" />
      </g>
    </svg>
  );
}
