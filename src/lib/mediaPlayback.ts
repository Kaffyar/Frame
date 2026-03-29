export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

const warmedMediaUrlCache = new Map<string, string>();
const warmedMediaPromiseCache = new Map<string, Promise<string>>();

export function isMobileLikeViewport(maxWidth: number): boolean {
  return (
    window.matchMedia("(pointer: coarse)").matches ||
    window.matchMedia(`(max-width: ${maxWidth}px)`).matches
  );
}

type NetworkInformationLike = {
  effectiveType?: string;
  saveData?: boolean;
  downlink?: number;
  rtt?: number;
};

function getConnectionInfo(): NetworkInformationLike | null {
  if (typeof navigator === "undefined") {
    return null;
  }

  const extendedNavigator = navigator as Navigator & {
    connection?: NetworkInformationLike;
    mozConnection?: NetworkInformationLike;
    webkitConnection?: NetworkInformationLike;
  };

  return (
    extendedNavigator.connection ??
    extendedNavigator.mozConnection ??
    extendedNavigator.webkitConnection ??
    null
  );
}

function getDeviceMemory(): number | null {
  if (typeof navigator === "undefined") {
    return null;
  }

  const extendedNavigator = navigator as Navigator & {
    deviceMemory?: number;
  };

  return typeof extendedNavigator.deviceMemory === "number"
    ? extendedNavigator.deviceMemory
    : null;
}

function isConstrainedConnection(connection: NetworkInformationLike | null): boolean {
  return (
    connection?.saveData === true ||
    (connection?.effectiveType !== undefined &&
      ["slow-2g", "2g", "3g"].includes(connection.effectiveType))
  );
}

export function shouldUseLiteMedia(maxWidth: number): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const connection = getConnectionInfo();
  const slowConnection = isConstrainedConnection(connection);

  return window.matchMedia(`(max-width: ${maxWidth}px)`).matches || slowConnection;
}

function isLocalDevelopmentHost(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return ["localhost", "127.0.0.1"].includes(window.location.hostname);
}

export function shouldUseHighQualityDesktopVideo(maxWidth: number): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  if (shouldUseLiteMedia(maxWidth)) {
    return false;
  }

  if (isLocalDevelopmentHost()) {
    return true;
  }

  const connection = getConnectionInfo();
  const deviceMemory = getDeviceMemory();

  if (isConstrainedConnection(connection)) {
    return false;
  }

  const strongConnection = connection?.downlink !== undefined && connection.downlink >= 18;
  const strongMemory = deviceMemory === null || deviceMemory >= 8;

  return strongConnection && strongMemory;
}

export function getWarmedMediaSource(src: string): string | null {
  return warmedMediaUrlCache.get(src) ?? null;
}

export async function warmMediaSource(
  src: string,
  signal?: AbortSignal,
): Promise<string> {
  if (typeof window === "undefined") {
    return src;
  }

  const cachedSource = warmedMediaUrlCache.get(src);
  if (cachedSource) {
    return cachedSource;
  }

  const pendingSource = warmedMediaPromiseCache.get(src);
  if (pendingSource) {
    return pendingSource;
  }

  const warmingPromise = fetch(src, {
    cache: "force-cache",
    credentials: "same-origin",
    signal,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to warm media source: ${response.status}`);
      }

      return response.blob();
    })
    .then((blob) => {
      const objectUrl = URL.createObjectURL(blob);
      warmedMediaUrlCache.set(src, objectUrl);
      warmedMediaPromiseCache.delete(src);
      return objectUrl;
    })
    .catch((error) => {
      warmedMediaPromiseCache.delete(src);
      throw error;
    });

  warmedMediaPromiseCache.set(src, warmingPromise);
  return warmingPromise;
}
