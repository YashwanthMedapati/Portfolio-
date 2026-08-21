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
  const parts = text.split(/(\s+)/);

  return (
    <Tag className={className} aria-label={text}>
      {parts.map((part, partIndex) =>
        /^\s+$/.test(part) ? (
          <span key={`space-${partIndex}`} aria-hidden>
            {" "}
          </span>
        ) : (
          <span key={`${part}-${partIndex}`} aria-hidden className="inline-block whitespace-nowrap">
            {Array.from(part).map((char, index) => (
              <span
                key={`${char}-${partIndex}-${index}`}
                className={`letter-hover-char inline-block origin-bottom ${letterClassName}`}
              >
                {char}
              </span>
            ))}
          </span>
        )
      )}
    </Tag>
  );
}
