import { io, type Socket } from "socket.io-client";
import { getUserId } from "./getUserId";
import { getToken } from "./getToken";

/**
 * - default → NEXT_PUBLIC_BASE_URL (notifications and other events)
 * - chat → …/chat (receiveMessage, joinConversation, …)
 * - broadcast → …/broadcast (receiveBroadcastMessage, joinBroadcast, …)
 */
export type SocketNamespace = "default" | "chat" | "broadcast";

const NAMESPACE_SUFFIX: Record<SocketNamespace, string> = {
  default: "",
  chat: "/chat",
  broadcast: "/broadcast",
};

const sockets: Partial<Record<SocketNamespace, Socket | null>> = {};
let connectedUserId: string | null = null;

function socketUrl(namespace: SocketNamespace) {
  const base = (process.env.NEXT_PUBLIC_BASE_URL ?? "").replace(/\/$/, "");
  const suffix = NAMESPACE_SUFFIX[namespace];
  return suffix ? `${base}${suffix}` : base;
}

function disconnectNamespace(namespace: SocketNamespace) {
  const existing = sockets[namespace];
  if (!existing) return;
  existing.removeAllListeners();
  existing.disconnect();
  sockets[namespace] = null;
}

function disconnectAll() {
  (Object.keys(NAMESPACE_SUFFIX) as SocketNamespace[]).forEach(disconnectNamespace);
  connectedUserId = null;
}

/**
 * Shared Socket.IO client for a namespace. Recreates connections when the
 * logged-in user changes so rooms stay bound to the correct userId.
 */
export const initializeSocket = (
  namespace: SocketNamespace = "default",
): Socket | null => {
  const userId = String(getUserId() ?? "");
  const token = String(getToken() ?? "");

  if (!userId) {
    return null;
  }

  if (connectedUserId !== null && connectedUserId !== userId) {
    disconnectAll();
  }

  connectedUserId = userId;

  let socket = sockets[namespace] ?? null;

  if (!socket) {
    socket = io(socketUrl(namespace), {
      query: { userId },
      auth: { token },
      autoConnect: true,
    });
    sockets[namespace] = socket;
  } else if (!socket.connected) {
    socket.connect();
  }

  return socket;
};

/** Ensures default, chat, and broadcast sockets are connected. */
export function initializeAllSockets(): {
  default: Socket | null;
  chat: Socket | null;
  broadcast: Socket | null;
} {
  return {
    default: initializeSocket("default"),
    chat: initializeSocket("chat"),
    broadcast: initializeSocket("broadcast"),
  };
}

export const getSocket = (namespace: SocketNamespace = "default") =>
  sockets[namespace] ?? null;

/** Tear down one namespace, or all when omitted. */
export function teardownSocket(namespace?: SocketNamespace) {
  if (namespace) {
    disconnectNamespace(namespace);
    const anyLeft = (Object.keys(NAMESPACE_SUFFIX) as SocketNamespace[]).some(
      (key) => Boolean(sockets[key]),
    );
    if (!anyLeft) connectedUserId = null;
    return;
  }
  disconnectAll();
}
