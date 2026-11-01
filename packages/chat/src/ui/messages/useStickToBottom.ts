"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { useReducedMotion } from "@mantine/hooks";

/** Within this many px of the bottom counts as being at the bottom. */
const AT_BOTTOM_PX = 80;

/** The glide covers 63% of the distance left in this long, so it eases out. */
const GLIDE_MS = 100;

/** How far a finger has to move down before it counts as scrolling up. */
const TOUCH_PX = 10;

const UP_KEYS = new Set(["ArrowUp", "PageUp", "Home"]);

export interface StickToBottom {
  /** Goes on <ScrollArea viewportRef>. */
  viewportRef: RefObject<HTMLDivElement | null>;
  /** Goes on the element wrapping the rows, inside the ScrollArea. */
  contentRef: RefObject<HTMLDivElement | null>;
  /** Goes on <ScrollArea onScrollPositionChange>. */
  onScrollPositionChange: (position: { x: number; y: number }) => void;
  /** False while the user reads elsewhere in a transcript that scrolls. Drives the jump affordance. */
  following: boolean;
  /** Re-arms following and goes to the bottom. */
  scrollToBottom: (behavior?: ScrollBehavior) => void;
}

/**
 * Follows the bottom of a scroller while the user wants it to. Intent comes from the user's
 * input and from scrollTop moving up, never from the distance to the bottom.
 */
export function useStickToBottom(): StickToBottom {
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const followRef = useRef(true);
  const lastTopRef = useRef(0);
  // where jump and the glide last put the page: the scroll event that follows is theirs
  const echoRef = useRef(Number.NaN);
  const frameRef = useRef(0);
  const holdRef = useRef(false);
  const [following, setFollowingState] = useState(true);
  const [overflows, setOverflows] = useState(false);
  // the chat only renders in the browser, so read it now rather than glide once first
  const reduceMotion = useReducedMotion(undefined, { getInitialValueInEffect: false });

  const setFollowing = useCallback((next: boolean) => {
    if (followRef.current === next) return;
    followRef.current = next;
    setFollowingState(next);
  }, []);

  const moveTo = useCallback((viewport: HTMLDivElement, top: number) => {
    // writing the same value fires no scroll event, and would leave a stale echo
    if (Math.abs(viewport.scrollTop - top) < 0.5) return;
    lastTopRef.current = top;
    echoRef.current = top;
    viewport.scrollTop = top;
  }, []);

  const jump = useCallback(() => {
    const viewport = viewportRef.current;
    if (viewport) moveTo(viewport, viewport.scrollHeight - viewport.clientHeight);
  }, [moveTo]);

  // aims at the bottom again every frame, so it keeps up with content that is still growing
  const glideToBottom = useCallback(() => {
    if (frameRef.current) return;
    let last = 0;
    const step = (now: number) => {
      frameRef.current = 0;
      const viewport = viewportRef.current;
      if (!viewport || !followRef.current || holdRef.current) return;
      const gap = viewport.scrollHeight - viewport.clientHeight - viewport.scrollTop;
      if (gap <= 1) return;

      const eased = gap * (1 - Math.exp(-(last ? now - last : 16) / GLIDE_MS));
      // at least 1px, or a step rounded away to nothing would never arrive
      moveTo(viewport, viewport.scrollTop + Math.min(gap, Math.max(1, eased)));
      last = now;
      frameRef.current = requestAnimationFrame(step);
    };
    frameRef.current = requestAnimationFrame(step);
  }, [moveTo]);

  const scrollToBottom = useCallback(
    (behavior: ScrollBehavior = "smooth") => {
      setFollowing(true);
      if (behavior === "smooth" && !reduceMotion) glideToBottom();
      else jump();
    },
    [glideToBottom, jump, reduceMotion, setFollowing],
  );

  const onScrollPositionChange = useCallback(
    ({ y }: { y: number }) => {
      const viewport = viewportRef.current;
      if (!viewport) return;

      const echo = Math.abs(y - echoRef.current) <= 1;
      echoRef.current = Number.NaN;
      const delta = y - lastTopRef.current;
      lastTopRef.current = y;
      if (echo) return;

      const gap = viewport.scrollHeight - y - viewport.clientHeight;
      // near the bottom, a move up is content shrinking (Thought folding) or the user, whose
      // input already stopped following, so only a move down re-arms
      if (gap <= 1 || (gap <= AT_BOTTOM_PX && delta > 0)) {
        setFollowing(true);
      } else if (delta < -1 && gap > AT_BOTTOM_PX) {
        setFollowing(false);
      }
    },
    [setFollowing],
  );

  useEffect(() => {
    const viewport = viewportRef.current;
    const content = contentRef.current;
    if (!viewport || !content) return;
    // the ScrollArea's root: the scrollbars and the margins beside the content are in it too
    const root = viewport.parentElement ?? viewport;

    const follow = () => {
      if (followRef.current && !holdRef.current) (reduceMotion ? jump : glideToBottom)();
    };
    const observer = new ResizeObserver(() => {
      setOverflows(viewport.scrollHeight - viewport.clientHeight > 1);
      follow();
    });

    observer.observe(content, { box: "border-box" });
    observer.observe(viewport);

    // a chat too short to scroll has no "up"
    const userScrollsUp = () => {
      if (followRef.current && viewport.scrollTop > 0) setFollowing(false);
    };

    // read from input, not the scroll: the next follow would cancel the scroll before
    // onScrollPositionChange saw it
    const onWheel = (event: WheelEvent) => {
      // ctrl + wheel is a trackpad pinch, which zooms
      if (event.ctrlKey || event.deltaY >= 0) return;
      if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) userScrollsUp();
    };
    let touchX = 0;
    let touchY = 0;
    const onTouchStart = (event: TouchEvent) => {
      touchX = event.touches[0].clientX;
      touchY = event.touches[0].clientY;
    };
    // a finger moving down scrolls up; one moving sideways is swiping a wide table
    const onTouchMove = (event: TouchEvent) => {
      const dy = event.touches[0].clientY - touchY;
      if (dy > TOUCH_PX && dy > Math.abs(event.touches[0].clientX - touchX)) userScrollsUp();
    };
    // focus is on <body> after a click on the transcript's text, so listen on window
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (!UP_KEYS.has(event.key) || target.isContentEditable || target.closest("input, textarea"))
        return;
      if (target === document.body || viewport.contains(target)) userScrollsUp();
    };
    // opening a tool panel or Thought grows the content where the user is looking; following
    // would scroll it out of view. React hasn't flipped aria-expanded yet, so "false" is opening
    const onClick = (event: MouseEvent) => {
      if ((event.target as HTMLElement).closest('[aria-expanded="false"]')) setFollowing(false);
    };
    // a held mouse button may be selecting; text moving under it would drag the selection along.
    // only the main button: a right-click menu on macOS swallows the release
    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === "mouse" && event.button === 0) holdRef.current = true;
    };
    const release = () => {
      if (!holdRef.current) return;
      holdRef.current = false;
      follow();
    };

    root.addEventListener("wheel", onWheel, { passive: true });
    root.addEventListener("touchstart", onTouchStart, { passive: true });
    root.addEventListener("touchmove", onTouchMove, { passive: true });
    root.addEventListener("pointerdown", onPointerDown);
    content.addEventListener("click", onClick);
    window.addEventListener("keydown", onKeyDown);
    // on window: the button can be released outside the transcript, or not at all
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);
    window.addEventListener("blur", release);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
      root.removeEventListener("wheel", onWheel);
      root.removeEventListener("touchstart", onTouchStart);
      root.removeEventListener("touchmove", onTouchMove);
      root.removeEventListener("pointerdown", onPointerDown);
      content.removeEventListener("click", onClick);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
      window.removeEventListener("blur", release);
    };
  }, [glideToBottom, jump, reduceMotion, setFollowing]);

  return {
    viewportRef,
    contentRef,
    onScrollPositionChange,
    following: following || !overflows,
    scrollToBottom,
  };
}
