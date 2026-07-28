"use client";

import React, { useEffect, useState } from "react";

interface CardImageWithFallbackProps {
  src?: string;
  fallbackSrc: string;
  alt: string;
  className?: string;
}

export const CardImageWithFallback: React.FC<CardImageWithFallbackProps> = ({
  src,
  fallbackSrc,
  alt,
  className = ""
}) => {
  const [currentSrc, setCurrentSrc] = useState(src || fallbackSrc);

  useEffect(() => {
    setCurrentSrc(src || fallbackSrc);
  }, [src, fallbackSrc]);

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      onError={() => {
        if (currentSrc !== fallbackSrc) {
          setCurrentSrc(fallbackSrc);
        }
      }}
    />
  );
};
