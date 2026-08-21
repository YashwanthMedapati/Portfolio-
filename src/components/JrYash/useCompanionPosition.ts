import { useCallback, useEffect, useRef, useState } from "react";

export const DESKTOP_SPRITE_SIZE = 92;
export const MOBILE_SPRITE_SIZE = 64;
export const DESKTOP_STAGE_WIDTH = 184;
export const MOBILE_STAGE_WIDTH = 132;
export const CORNER_PADDING = 12;

const DESKTOP_EDGE_OFFSET = 204;
const BOTTOM_OFFSET = 118;
const MOBILE_BOTTOM_OFFSET = 20;

function restingY(mobile: boolean, viewportHeight: number, stageHeight: number) {
  const offset = mobile ? MOBILE_BOTTOM_OFFSET : BOTTOM_OFFSET;
  return clamp(viewportHeight - stageHeight - offset, CORNER_PADDING, viewportHeight - stageHeight - CORNER_PADDING);
}
const MOVE_THRESHOLD = 4;
const STOP_RUNNING_DELAY = 280;
const FOLLOW_GAP = 96;
const REPEL_RADIUS = 86;

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function restingX(mobile: boolean, viewportWidth: number, stageWidth: number) {
  return mobile
    ? clamp(CORNER_PADDING, CORNER_PADDING, viewportWidth - stageWidth - CORNER_PADDING)
    : clamp(viewportWidth - DESKTOP_EDGE_OFFSET, CORNER_PADDING, viewportWidth - stageWidth - CORNER_PADDING);
}

export function useCompanionPosition({
  isFollowingCursor,
  isOpen,
  reducedMotion,
  onActivity,
}: {
  isFollowingCursor: boolean;
  isOpen: boolean;
  reducedMotion: boolean;
  onActivity: () => void;
}) {
  const [isMobile, setIsMobile] = useState(false);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });

  // Must start null on both server and client's first render (SSR has no
  // `window` to compute a position from) - nothing renders until the effect
  // below places it, right after mount. That's what keeps hydration honest:
  // no structural difference for React to reconcile.
  const [x, setX] = useState<number | null>(null);
  const [y, setY] = useState<number | null>(null);
  const [moveDir, setMoveDir] = useState<"left" | "right" | null>(null);
  const [hasCustomPosition, setHasCustomPosition] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragParkedFollow, setDragParkedFollow] = useState(false);
  const [isNearHero, setIsNearHero] = useState(true);

  const isOpenRef = useRef(isOpen);
  const positionRef = useRef({ x: 0, y: 0 });
  const dragRef = useRef({ offsetX: 0, offsetY: 0, moved: false, pointerId: -1 });

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  const applyDragPosition = useCallback((clientX: number, clientY: number) => {
    const spriteSize = isMobile ? MOBILE_SPRITE_SIZE : DESKTOP_SPRITE_SIZE;
    const stageWidth = isMobile ? MOBILE_STAGE_WIDTH : DESKTOP_STAGE_WIDTH;
    const stageHeight = Math.round(spriteSize * 1.55);
    const nextX = clamp(clientX - dragRef.current.offsetX, CORNER_PADDING, window.innerWidth - stageWidth - CORNER_PADDING);
    const nextY = clamp(clientY - dragRef.current.offsetY, CORNER_PADDING, window.innerHeight - stageHeight - CORNER_PADDING);
    const movementX = nextX - positionRef.current.x;
    if (Math.abs(movementX) >= MOVE_THRESHOLD) {
      setMoveDir(movementX < 0 ? "left" : "right");
    }
    if (Math.abs(movementX) > 3 || Math.abs(nextY - positionRef.current.y) > 3) {
      dragRef.current.moved = true;
    }
    positionRef.current = { x: nextX, y: nextY };
    setX(nextX);
    setY(nextY);
  }, [isMobile]);

  useEffect(() => {
    let retryTimer: ReturnType<typeof setTimeout> | undefined;

    const onResize = () => {
      // Mobile browsers fire resize repeatedly as the address bar
      // collapses/expands on scroll, and can occasionally report a
      // transient 0 width/height mid-transition. Reading that here would
      // permanently wedge the companion off-screen (every position below
      // is clamped to at least CORNER_PADDING, but a 0 viewport makes the
      // clamp's own min > max and it silently returns the negative max
      // instead) - so a bogus reading is retried shortly after, once the
      // transition has settled, rather than acted on or dropped for good.
      if (window.innerWidth <= 0 || window.innerHeight <= 0) {
        clearTimeout(retryTimer);
        retryTimer = setTimeout(onResize, 120);
        return;
      }
      const mobile = window.innerWidth < 640;
      setIsMobile(mobile);
      setViewport({ width: window.innerWidth, height: window.innerHeight });
      const spriteSize = mobile ? MOBILE_SPRITE_SIZE : DESKTOP_SPRITE_SIZE;
      const stageWidth = mobile ? MOBILE_STAGE_WIDTH : DESKTOP_STAGE_WIDTH;
      const stageHeight = Math.round(spriteSize * 1.55);
      setX(restingX(mobile, window.innerWidth, stageWidth));
      setY(restingY(mobile, window.innerHeight, stageHeight));
    };
    onResize();
    window.addEventListener("resize", onResize);
    // Belt-and-braces alongside the resize listener: some mobile browser
    // chrome/viewport transitions resize the layout box without firing a
    // window "resize" event at all, which would otherwise leave the
    // companion stuck at whatever size it mounted at. ResizeObserver reacts
    // to the actual box size, independent of whether that event fires.
    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(document.documentElement);
    return () => {
      window.removeEventListener("resize", onResize);
      resizeObserver.disconnect();
      clearTimeout(retryTimer);
    };
  }, []);

  useEffect(() => {
    const updateSectionAwareness = () => {
      setIsNearHero(window.scrollY < window.innerHeight * 0.45);
    };

    updateSectionAwareness();
    window.addEventListener("scroll", updateSectionAwareness, { passive: true });
    window.addEventListener("hashchange", updateSectionAwareness);
    return () => {
      window.removeEventListener("scroll", updateSectionAwareness);
      window.removeEventListener("hashchange", updateSectionAwareness);
    };
  }, []);

  useEffect(() => {
    if (x !== null && y !== null) {
      positionRef.current = { x, y };
    }
  }, [x, y]);

  useEffect(() => {
    if (isFollowingCursor) return;
    const timer = window.setTimeout(() => setDragParkedFollow(false), 0);
    return () => window.clearTimeout(timer);
  }, [isFollowingCursor]);

  useEffect(() => {
    if (!dragParkedFollow || !isFollowingCursor || isDragging) return;
    const onFirstMove = () => setDragParkedFollow(false);
    window.addEventListener("mousemove", onFirstMove, { once: true });
    return () => window.removeEventListener("mousemove", onFirstMove);
  }, [dragParkedFollow, isFollowingCursor, isDragging]);

  useEffect(() => {
    if (!isDragging) return;

    const onPointerMove = (event: PointerEvent) => {
      if (dragRef.current.pointerId !== event.pointerId) return;
      applyDragPosition(event.clientX, event.clientY);
    };

    const onPointerUp = (event: PointerEvent) => {
      if (dragRef.current.pointerId !== event.pointerId) return;
      setIsDragging(false);
      setHasCustomPosition(true);
      if (isFollowingCursor) setDragParkedFollow(true);
      window.setTimeout(() => setMoveDir(null), STOP_RUNNING_DELAY);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    };
  }, [applyDragPosition, isDragging, isFollowingCursor]);

  useEffect(() => {
    if (reducedMotion || isMobile || !isFollowingCursor || dragParkedFollow || isDragging) {
      const t = setTimeout(() => setMoveDir(null), 0);
      return () => clearTimeout(t);
    }
    let stopTimer: ReturnType<typeof setTimeout> | undefined;

    const onMove = (e: MouseEvent) => {
      if (isOpenRef.current) return;
      onActivity();
      const spriteSize = DESKTOP_SPRITE_SIZE;
      const stageWidth = DESKTOP_STAGE_WIDTH;
      const stageHeight = Math.round(spriteSize * 1.55);
      const currentX = positionRef.current.x;
      const dx = e.clientX - (currentX + stageWidth / 2);
      let targetX = e.clientX + (dx < 0 ? FOLLOW_GAP : -FOLLOW_GAP);
      let targetY = e.clientY + 34;
      const centerX = targetX + stageWidth / 2;
      const centerY = targetY + spriteSize / 2;
      const distanceX = centerX - e.clientX;
      const distanceY = centerY - e.clientY;
      const distance = Math.hypot(distanceX, distanceY);

      if (distance < REPEL_RADIUS) {
        const strength = (REPEL_RADIUS - Math.max(distance, 1)) * 0.8;
        targetX += (distanceX / Math.max(distance, 1)) * strength;
        targetY += (distanceY / Math.max(distance, 1)) * strength;
      }

      const nextX = clamp(targetX, CORNER_PADDING, window.innerWidth - stageWidth - CORNER_PADDING);
      const nextY = clamp(targetY, CORNER_PADDING, window.innerHeight - stageHeight - CORNER_PADDING);
      const movementX = nextX - currentX;
      if (Math.abs(movementX) >= MOVE_THRESHOLD) {
        setMoveDir(movementX < 0 ? "left" : "right");
      }
      positionRef.current = { x: nextX, y: nextY };
      setX(nextX);
      setY(nextY);

      clearTimeout(stopTimer);
      stopTimer = setTimeout(() => setMoveDir(null), STOP_RUNNING_DELAY);
    };

    window.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("mousemove", onMove);
      clearTimeout(stopTimer);
    };
  }, [dragParkedFollow, isDragging, isFollowingCursor, isMobile, onActivity, reducedMotion]);

  useEffect(() => {
    if (isFollowingCursor || hasCustomPosition || x === null) return;
    const frame = requestAnimationFrame(() => {
      const spriteSize = isMobile ? MOBILE_SPRITE_SIZE : DESKTOP_SPRITE_SIZE;
      const stageWidth = isMobile ? MOBILE_STAGE_WIDTH : DESKTOP_STAGE_WIDTH;
      const stageHeight = Math.round(spriteSize * 1.55);
      setX(restingX(isMobile, window.innerWidth, stageWidth));
      setY(restingY(isMobile, window.innerHeight, stageHeight));
      setMoveDir(null);
    });
    return () => cancelAnimationFrame(frame);
  }, [hasCustomPosition, isFollowingCursor, isMobile, x]);

  const startDrag = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>, renderX: number, renderY: number) => {
      if (isOpen || event.button !== 0) return;
      onActivity();
      dragRef.current = {
        offsetX: event.clientX - renderX,
        offsetY: event.clientY - renderY,
        moved: false,
        pointerId: event.pointerId,
      };
      setIsDragging(true);
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [isOpen, onActivity]
  );

  const moveDrag = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      if (!isDragging || dragRef.current.pointerId !== event.pointerId) return;
      applyDragPosition(event.clientX, event.clientY);
    },
    [applyDragPosition, isDragging]
  );

  const endDrag = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      if (!isDragging || dragRef.current.pointerId !== event.pointerId) return;
      setIsDragging(false);
      setHasCustomPosition(true);
      if (isFollowingCursor) setDragParkedFollow(true);
      window.setTimeout(() => setMoveDir(null), STOP_RUNNING_DELAY);
      try {
        event.currentTarget.releasePointerCapture(event.pointerId);
      } catch {}
    },
    [isDragging, isFollowingCursor]
  );

  const consumeDragMoved = useCallback(() => {
    const moved = dragRef.current.moved;
    dragRef.current.moved = false;
    return moved;
  }, []);

  return {
    x,
    y,
    isMobile,
    viewport,
    moveDir,
    hasCustomPosition,
    isDragging,
    isNearHero,
    startDrag,
    moveDrag,
    endDrag,
    consumeDragMoved,
  };
}
