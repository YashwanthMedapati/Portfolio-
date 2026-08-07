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
          className={`letter-hover-char inline-block origin-bottom ${letterClassName}`}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </Tag>
  );
}
