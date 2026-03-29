export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function isMobileLikeViewport(maxWidth: number): boolean {
  return (
    window.matchMedia("(pointer: coarse)").matches ||
    window.matchMedia(`(max-width: ${maxWidth}px)`).matches
  );
}
