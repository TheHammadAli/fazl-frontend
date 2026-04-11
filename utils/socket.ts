// utils/socket.ts
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const initializeSocket = () => {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_BASE_URL as string, {
      transports: ["websocket", "polling"], // allow fallback
    });
  }
  return socket;
};
