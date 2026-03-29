const firedStageEvents = new Set<string>();

export const VOYAGE_STAGE_EVENTS = {
  preloadJourney: "voyage:preload-journey",
  preloadProjects: "voyage:preload-projects",
} as const;

export type VoyageStageEventName =
  (typeof VOYAGE_STAGE_EVENTS)[keyof typeof VOYAGE_STAGE_EVENTS];

export function emitVoyageStageEvent(eventName: VoyageStageEventName): void {
  if (typeof window === "undefined" || firedStageEvents.has(eventName)) {
    return;
  }

  firedStageEvents.add(eventName);
  window.dispatchEvent(new CustomEvent(eventName));
}

export function hasVoyageStageEventFired(eventName: VoyageStageEventName): boolean {
  return firedStageEvents.has(eventName);
}

export function onVoyageStageEvent(
  eventName: VoyageStageEventName,
  listener: () => void,
): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const wrappedListener = () => {
    listener();
  };

  window.addEventListener(eventName, wrappedListener);

  if (hasVoyageStageEventFired(eventName)) {
    listener();
  }

  return () => {
    window.removeEventListener(eventName, wrappedListener);
  };
}
