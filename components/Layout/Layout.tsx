"use client";
import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import MobileHeader from "./MobileHeader";
import { useGetUnreadNotificationsCountQuery } from "@/store/services/notificationService";
import { getUserId } from "@/utils/getUserId";
import { useAppDispatch } from "@/store/store";
import { baseApi } from "@/store/baseApi";
import { initializeSocket } from "@/utils/socket";
import { useUnreadMessagesCountQuery } from "@/store/services/chatService";
import { playNotificationSound } from "@/utils/playNotificationSound";
import {
  isDesktopBrowser,
  requestBrowserNotificationPermission,
  showDesktopOsNotification,
} from "@/utils/showDesktopNotification";
import { useDictionary } from "@/dictionaries/DictionaryProvider";

function getSocketSenderId(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  const payload = data as Record<string, unknown>;
  if (payload.senderId != null) return String(payload.senderId);
  if (typeof payload.sender === "string") return payload.sender;
  if (payload.sender && typeof payload.sender === "object") {
    const sender = payload.sender as { id?: string; _id?: string };
    return sender.id ?? sender._id;
  }
  return undefined;
}

function isFromCurrentUser(data: unknown, currentUserId?: string | null): boolean {
  if (!currentUserId) return false;
  const senderId = getSocketSenderId(data);
  return senderId != null && senderId === String(currentUserId);
}

function getPreviewText(data: Record<string, unknown>): string {
  const text = data.message ?? data.text ?? data.content;
  return typeof text === "string" ? text : "";
}

function getSenderMeta(data: Record<string, unknown>): {
  name: string;
  image?: string;
} {
  const sender = data.sender;
  if (sender && typeof sender === "object") {
    const s = sender as { name?: string; image?: string; avatar?: string };
    return {
      name: s.name?.trim() || "",
      image: s.image ?? s.avatar,
    };
  }
  return {
    name:
      (typeof data.senderName === "string" && data.senderName) ||
      (typeof data.name === "string" && data.name) ||
      "",
    image:
      (typeof data.senderImage === "string" && data.senderImage) ||
      (typeof data.image === "string" && data.image) ||
      undefined,
  };
}

function Layout({ children }: { children: React.ReactNode }) {
  const [openSidebar, setOpenSidebar] = useState(false);
  const userId = getUserId();
  const [readCount, setReadCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const { data: unreadNotificationsCount } = useGetUnreadNotificationsCountQuery(userId, {
    skip: !userId,
  });
  const { data: unreadMessagesCount } = useUnreadMessagesCountQuery(
    { userId: userId ?? "" },
    { skip: !userId },
  );
  const dispatch = useAppDispatch();
  const { placeholders } = useDictionary();

  useEffect(() => {
    // Native Allow/Block on first click if still undecided (e.g. Google login / already signed in).
    if (!userId || !isDesktopBrowser()) return;
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "default") return;

    const askNativePermission = () => {
      void requestBrowserNotificationPermission();
      window.removeEventListener("pointerdown", askNativePermission);
    };
    window.addEventListener("pointerdown", askNativePermission);
    return () => window.removeEventListener("pointerdown", askNativePermission);
  }, [userId]);

  useEffect(() => {
    setReadCount(unreadNotificationsCount?.data?.count || 0);
  }, [unreadNotificationsCount?.data?.count]);

  useEffect(() => {
    const totalUnread =
      unreadMessagesCount?.data?.reduce(
        (sum: number, item: { unreadCount?: number }) => sum + (item.unreadCount ?? 0),
        0,
      ) ?? 0;
    setUnreadMessages(totalUnread);
  }, [unreadMessagesCount?.data]);

  useEffect(() => {
    const socket = initializeSocket();
    if (!socket) return;

    const onNotification = (data: Record<string, unknown> | undefined) => {
      if (data?.type === "SERVICE_REQUEST") {
        playNotificationSound(data?.type as string);
      } else {
        playNotificationSound("REST");
      }
      dispatch(baseApi.util.invalidateTags(["NOTIFICATIONS"]));

      showDesktopOsNotification({
        title: placeholders.notifications_title,
        body: getPreviewText(data ?? {}) || placeholders.notifications_title,
        icon: typeof data?.image === "string" ? data.image : undefined,
        tag: "app-notification",
        onClick: () => setOpenSidebar(true),
      });
    };

    const onReceiveMessage = (data: unknown) => {
      if (!isFromCurrentUser(data, userId)) {
        playNotificationSound("REST");
        if (data && typeof data === "object") {
          const payload = data as Record<string, unknown>;
          const { name, image } = getSenderMeta(payload);
          showDesktopOsNotification({
            title: name || placeholders.chat_title,
            body: getPreviewText(payload) || placeholders.chat_title,
            icon: image,
            tag: "chat-message",
          });
        }
      }
      dispatch(baseApi.util.invalidateTags(["Chat"]));
    };

    const onReceiveBroadcastMessage = (data: unknown) => {
      if (!isFromCurrentUser(data, userId)) {
        playNotificationSound("SERVICE_REQUEST");
        if (data && typeof data === "object") {
          const payload = data as Record<string, unknown>;
          const { name, image } = getSenderMeta(payload);
          showDesktopOsNotification({
            title: name || placeholders.chat_title,
            body: getPreviewText(payload) || placeholders.chat_title,
            icon: image,
            tag: "broadcast-message",
          });
        }
      }
      dispatch(baseApi.util.invalidateTags(["BROADCAST"]));
    };

    socket.on("notification", onNotification);
    socket.on("receiveMessage", onReceiveMessage);
    socket.on("receiveBroadcastMessage", onReceiveBroadcastMessage);

    return () => {
      socket.off("notification", onNotification);
      socket.off("receiveMessage", onReceiveMessage);
      socket.off("receiveBroadcastMessage", onReceiveBroadcastMessage);
    };
  }, [dispatch, userId, placeholders.notifications_title, placeholders.chat_title]);

  return (
    <div className="lg:flex">
      <MobileHeader
        unreadMessages={unreadMessages}
        unreadCount={readCount}
        openSidebar={openSidebar}
        setOpenSidebar={setOpenSidebar}
      />
      <Sidebar
        unreadMessages={unreadMessages}
        unreadCount={readCount}
        setUnreadMessages={setUnreadMessages}
        setReadCount={setReadCount}
        openSidebar={openSidebar}
        setOpenSidebar={setOpenSidebar}
      />
      <div className="flex min-h-0 w-full flex-col lg:h-screen lg:overflow-y-auto">
        {children}
      </div>
    </div>
  );
}

export default Layout;
