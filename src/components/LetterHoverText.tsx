"use client";

import { ElementType } from "react";

type LetterHoverTextProps = {
  text: string;
  as?: "h1" | "p";
  className?: string;
  letterClassName?: string;
};

export function LetterHoverText({
  text,
  as = "p",
  className,
  letterClassName = "",
}: LetterHoverTextProps) {
  const Tag = as as ElementType;

  return (
    <Tag aria-label={text} className={className}>
      {Array.from(text).map((char, index) => (
        <span
          key={`${char}-${index}`}
          aria-hidden
          className={`inline-block origin-bottom transition-transform duration-150 ease-out hover:-translate-y-1 hover:scale-125 ${letterClassName}`}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </Tag>
  );
}
