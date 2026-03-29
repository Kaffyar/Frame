export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function isMobileLikeViewport(maxWidth: number): boolean {
  return (
    window.matchMedia("(pointer: coarse)").matches ||
    window.matchMedia(`(max-width: ${maxWidth}px)`).matches
  );
}

type NetworkInformationLike = {
  effectiveType?: string;
  saveData?: boolean;
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

export function shouldUseLiteMedia(maxWidth: number): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const connection = getConnectionInfo();
  const slowConnection =
    connection?.saveData === true ||
    (connection?.effectiveType !== undefined &&
      ["slow-2g", "2g", "3g"].includes(connection.effectiveType));

  return window.matchMedia(`(max-width: ${maxWidth}px)`).matches || slowConnection;
}
