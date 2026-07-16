type DesktopNotificationOptions = {
  title: string;
  body: string;
  icon?: string | null;
  tag?: string;
  onClick?: () => void;
};

/**
 * Desktop browser (not phone/tablet). Uses UA / touch — NOT viewport width —
 * so DevTools or a narrow window still counts as desktop web.
 */
export function isDesktopBrowser(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return false;
  }
  const ua = navigator.userAgent;
  if (/Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
    return false;
  }
  // iPad / iPadOS (reports as Mac with touch)
  if (/iPad/i.test(ua) || (navigator.maxTouchPoints > 1 && /Macintosh/i.test(ua))) {
    return false;
  }
  return true;
}

/** @deprecated Prefer isDesktopBrowser — width checks break with DevTools open. */
export function isDesktopWebViewport(): boolean {
  return isDesktopBrowser();
}

/**
 * Opens Chrome’s own dialog:
 *   "localhost wants to Show notifications" → Allow / Block
 *
 * Call from a user click, before any await, when possible.
 * If status is already "denied", Chrome will NOT show the dialog.
 */
export function requestBrowserNotificationPermission(): Promise<NotificationPermission | null> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return Promise.resolve(null);
  }
  if (!isDesktopBrowser()) return Promise.resolve(null);
  try {
    // Helps debug why Chrome doesn't show the native Allow/Block dialog.
    // - `permission === "denied"` => browser won't show dialog again
    // - `isSecureContext === false` => browser may block notifications on http
    // eslint-disable-next-line no-console
    console.debug("[notifications] requestPermission", {
      permission: Notification.permission,
      isSecureContext: window.isSecureContext,
      ua: navigator.userAgent,
    });
  } catch {
    // ignore
  }
  return Notification.requestPermission();
}

/**
 * OS / browser notification for desktop web only.
 */
export function showDesktopOsNotification({
  title,
  body,
  icon,
  tag,
  onClick,
}: DesktopNotificationOptions) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (!isDesktopBrowser()) return;
  if (Notification.permission !== "granted") return;

  const text = body?.trim();
  if (!title?.trim() && !text) return;

  const notification = new Notification(title || "Notification", {
    body: text || undefined,
    icon: icon?.trim() || undefined,
    tag: tag || undefined,
  });

  notification.onclick = () => {
    window.focus();
    onClick?.();
    notification.close();
  };
}
