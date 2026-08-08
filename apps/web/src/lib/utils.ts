import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * detects whether the current client is a mobile or touch device.
 *
 * uses three signals:
 * - the primary pointing device is touch
 * - navigator reports at least one touch contact point
 * - user agent string contains mobile-related keywords
 *
 * must only be called in a browser environment
 */
export function isMobileDevice(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const hasTouch = navigator.maxTouchPoints > 0;
  const isMobileUA = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  return (coarsePointer && hasTouch) || isMobileUA;
}
