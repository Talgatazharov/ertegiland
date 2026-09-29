import { useId } from "react";
import type { Character } from "../types";
export function LegacyPortrait({
  character,
  small = false,
}: {
  character: Character;
  small?: boolean;
}) {
  const uid = useId().replaceAll(":", "");
  const child = character.id === "tazsha";
  const warrior = character.id === "tostik" || character.id === "kendebai";
  const colors = ["#d4e4dc", "#527c66", "#315a50"];
  return (
    <svg
      className={small ? "portrait small" : "portrait"}
      viewBox="0 0 300 260"
      role="img"
      aria-label={character.name + " — көркем бейне"}
    >
      <defs>
        <linearGradient id={uid} x2="0" y2="1">
          <stop stopColor={colors[0]} />
          <stop offset="1" stopColor="#f5ecd9" />
        </linearGradient>
      </defs>
      <path fill={"url(#" + uid + ")"} d="M0 0h300v260H0z" />
      <circle cx="240" cy="49" r="26" fill="#fff4cd" opacity=".8" />
      <path
        d="m0 172 73-75 62 56 74-83 91 112v78H0"
        fill={colors[1]}
        opacity=".16"
      />
      <path d="M0 220q84-71 169-13t131 0v53H0" fill={colors[1]} opacity=".2" />
      <path d="M66 260q8-92 84-92t85 92" fill={colors[2]} />
      <path d="m132 177 18 32 20-32 18 83h-72z" fill="#ead3a2" />
      <path d="m134 186-16 74m50-74 18 74" stroke="#d1a25c" strokeWidth="6" />
      <path d="M116 107q-10 73 34 78 45-5 36-78" fill="#dba675" />
      <ellipse cx="113" cy="134" rx="7" ry="12" fill="#dba675" />
      <ellipse cx="187" cy="134" rx="7" ry="12" fill="#dba675" />
      <path
        d="M118 111q32-19 64 0"
        fill="none"
        stroke="#523e31"
        strokeWidth="10"
      />
      <path
        d="M119 91q30-67 62 0l9 22h-80z"
        fill={warrior ? "#9d9d8d" : colors[2]}
      />
      <path d="M115 103h71" stroke="#dfb96e" strokeWidth="9" />
      {warrior && (
        <>
          <path d="m150 53 0-24" stroke="#d3ae61" strokeWidth="6" />
          <path d="M150 29q-18-13-4-22 18 4 4 22" fill="#cda451" />
          <path d="m112 115-3 44 13-8m64-36 6 44-14-8" fill="#9d9d8d" />
        </>
      )}
      <path
        d="m129 127 10-2m23 0 10 2"
        stroke="#493d34"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="135" cy="134" r="2.5" fill="#39372e" />
      <circle cx="166" cy="134" r="2.5" fill="#39372e" />
      <path
        d="m150 138-3 10h7m-14 12q11 8 22-1"
        fill="none"
        stroke="#995f47"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {!child && (
        <path
          d="M149 151q-17-8-24 5 14 2 25-1 14 6 26 0-13-9-24-4"
          fill="#544031"
        />
      )}
      <g fill="none" stroke="#d6b570" strokeWidth="3">
        <path d="M90 223q15-18 22 0t-14 8m101-8q-15-18-22 0t14 8" />
      </g>
      <path
        d="m29 46 4 9 9 4-9 3-4 10-3-10-10-3 10-4"
        fill="#b99356"
        opacity=".6"
      />
    </svg>
  );
}
