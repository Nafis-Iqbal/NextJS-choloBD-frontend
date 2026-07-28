"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { animate, type AnimationPlaybackControls, useMotionValue } from "framer-motion";

type ScrollDirection = -1 | 1;

function wrapPosition(value: number, distance: number): number {
  if (!distance || distance <= 0) return 0;

  let wrapped = value;
  while (wrapped <= -2 * distance) wrapped += distance;
  while (wrapped > 0) wrapped -= distance;
  return wrapped;
}

export function useAutoScrollMarquee(
  itemCount: number,
  cardWidth: number,
  animationSpeed: number,
  cardGap = 16
) {
  const x = useMotionValue(0);
  const [direction, setDirection] = useState<ScrollDirection>(-1);
  const directionRef = useRef<ScrollDirection>(-1);
  const frameRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number | null>(null);
  const nudgeControlsRef = useRef<AnimationPlaybackControls | null>(null);

  const cardTotalWidth = cardWidth + cardGap;
  const scrollDistance = cardTotalWidth * itemCount;

  const stopLoop = useCallback(() => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    lastTimestampRef.current = null;
  }, []);

  const stopNudge = useCallback(() => {
    nudgeControlsRef.current?.stop();
    nudgeControlsRef.current = null;
  }, []);

  const startLoop = useCallback(() => {
    if (!scrollDistance) return;

    stopLoop();

    const pixelsPerSecond = scrollDistance / Math.max(animationSpeed, 1);

    const tick = (timestamp: number) => {
      if (lastTimestampRef.current == null) {
        lastTimestampRef.current = timestamp;
      }

      const deltaMs = timestamp - lastTimestampRef.current;
      lastTimestampRef.current = timestamp;

      const deltaX = directionRef.current * pixelsPerSecond * (deltaMs / 1000);
      const nextPosition = wrapPosition(x.get() + deltaX, scrollDistance);
      x.set(nextPosition);

      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
  }, [animationSpeed, scrollDistance, stopLoop, x]);

  const setScrollDirection = useCallback(
    (nextDirection: ScrollDirection) => {
      if (!scrollDistance) return;

      directionRef.current = nextDirection;
      setDirection(nextDirection);

      const startPosition = wrapPosition(x.get(), scrollDistance);
      const nudgedPosition = wrapPosition(
        startPosition + nextDirection * cardTotalWidth,
        scrollDistance
      );

      stopLoop();
      stopNudge();
      x.set(startPosition);

      nudgeControlsRef.current = animate(x, nudgedPosition, {
        duration: 0.35,
        ease: "easeInOut",
        onComplete: () => {
          x.set(nudgedPosition);
          startLoop();
        },
      });
    },
    [cardTotalWidth, scrollDistance, startLoop, stopLoop, stopNudge, x]
  );

  useEffect(() => {
    if (!scrollDistance) {
      stopLoop();
      stopNudge();
      x.set(0);
      return;
    }

    directionRef.current = -1;
    setDirection(-1);
    x.set(-scrollDistance);
    startLoop();

    return () => {
      stopLoop();
      stopNudge();
    };
  }, [scrollDistance, startLoop, stopLoop, stopNudge, x]);

  return {
    x,
    direction,
    scrollDistance,
    cardTotalWidth,
    handleScrollLeft: () => setScrollDirection(1),
    handleScrollRight: () => setScrollDirection(-1),
  };
}
