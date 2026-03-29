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
