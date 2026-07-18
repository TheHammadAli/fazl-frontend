import { io, type Socket } from "socket.io-client";
import { getUserId } from "./getUserId";
import { getToken } from "./getToken";

let socket: Socket | null = null;
let connectedUserId: string | null = null;

/**
 * Shared Socket.IO client. Recreates the connection when the logged-in user changes
 * so chat/notification rooms are bound to the correct userId.
 */
export const initializeSocket = () => {
  const userId = String(getUserId() ?? "");
  const token = String(getToken() ?? "");

  if (!userId) {
    return null;
  }

  if (socket && connectedUserId !== userId) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
    connectedUserId = null;
  }

  if (!socket) {
    connectedUserId = userId;
    socket = io(process.env.NEXT_PUBLIC_BASE_URL!, {
      query: { userId },
      auth: { token },
      autoConnect: true,
    });
  } else if (!socket.connected) {
    socket.connect();
  }

  return socket;
};

export const getSocket = () => socket;

export function teardownSocket() {
  if (!socket) return;
  socket.removeAllListeners();
  socket.disconnect();
  socket = null;
  connectedUserId = null;
}
