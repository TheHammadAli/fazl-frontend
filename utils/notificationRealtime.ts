import { teardownSocket } from "./socket";

/** Server Socket.IO event (must match backend). */
export const NOTIFICATION_SOCKET_EVENT = "notification" as const;

/** Dispatched on `window` before RTK invalidates so the list can reset to page 1. */
export const NEW_NOTIFICATION_WINDOW_EVENT = "app:new-notification" as const;

/** Disconnects all shared Socket.IO clients from `socket.ts`. */
export function teardownNotificationSocket() {
  teardownSocket();
}
