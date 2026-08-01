"use client";
import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import MobileHeader from "./MobileHeader";
import { useGetUnreadNotificationsCountQuery } from "@/store/services/notificationService";
import { getUserId } from "@/utils/getUserId";
import { useAppDispatch } from "@/store/store";
import { baseApi } from "@/store/baseApi";
import { initializeSocket } from "@/utils/socket";
import { useUnreadMessagesCountQuery, useGetAllConversationsForUserQuery } from "@/store/services/chatService";
import { playNotificationSound } from "@/utils/playNotificationSound";
import inAppChatIcon from "@/assets/icons/in-app-icon-chat.png"
import {
  isDesktopBrowser,
  requestBrowserNotificationPermission,
  showDesktopOsNotification,
} from "@/utils/showDesktopNotification";
import { useDictionary } from "@/dictionaries/DictionaryProvider";
import NotificationIcon from "@/assets/icons/new-notification-icon.png"
import { useRouter } from "next/navigation";
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

/** API returns either `data: Thread[]` or `data: { conversations: Thread[] }`. */
function extractConversationIds(...sources: unknown[]): string[] {
  const ids = new Set<string>();

  const addFromList = (list: unknown) => {
    if (!Array.isArray(list)) return;
    for (const item of list) {
      if (!item || typeof item !== "object") continue;
      const row = item as Record<string, unknown>;
      const id =
        row._id ?? row.id ?? row.conversationId ?? row.conversation_id;
      if (id != null && String(id).trim()) ids.add(String(id));
    }
  };

  for (const source of sources) {
    if (!source) continue;
    if (Array.isArray(source)) {
      addFromList(source);
      continue;
    }
    if (typeof source !== "object") continue;
    const root = source as Record<string, unknown>;
    const data = root.data ?? source;
    if (Array.isArray(data)) {
      addFromList(data);
      continue;
    }
    if (data && typeof data === "object") {
      const inner = data as Record<string, unknown>;
      addFromList(inner.conversations);
      addFromList(inner.data);
    }
  }

  return [...ids];
}

function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
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
  const { data: conversationsData } = useGetAllConversationsForUserQuery(
    { id: userId ?? "", page: 1, limit: 100 },
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
    if (!userId) return;

    const socket = initializeSocket();
    if (!socket) return;

    // DirectMessages treats `data` as Thread[]; Layout previously only read
    // `data.conversations`, so join never ran until ChatWindow opened a room.
    const conversationIds = extractConversationIds(
      conversationsData,
      unreadMessagesCount,
    );

    const joinConversationRooms = () => {
      if (!socket.connected || conversationIds.length === 0) return;
      conversationIds.forEach((conversationId) => {
        socket.emit("joinConversation", { conversationId });
      });
    };

    const onNotification = (data: Record<string, unknown> | undefined) => {
      if (data?.type === "SERVICE_REQUEST") {
        playNotificationSound(data?.type as string);
      } else {
        playNotificationSound("REST");
      }
      dispatch(baseApi.util.invalidateTags(["NOTIFICATIONS"]));

      showDesktopOsNotification({
        title: placeholders.new_notification,
        body: getPreviewText(data ?? {}) || placeholders.new_notification,
        icon: typeof data?.image === "string" ? data.image : NotificationIcon.src as string,
        tag: "app-notification",
        onClick: () => { if (data?.type === "PROMOTION") { router.push(`/chat?tab=broadcast_messages&type=received`) } else { setOpenSidebar(true) } },
      });
    };

    const onReceiveMessage = (data: unknown) => {
      if (!isFromCurrentUser(data, userId)) {
        playNotificationSound("REST");
        if (data && typeof data === "object") {
          const payload = data as Record<string, any>;
          const { name } = getSenderMeta(payload);
          showDesktopOsNotification({
            title: placeholders.new_notification,
            body: `${placeholders.new_message_from} ${name}`,
            icon: inAppChatIcon.src as string,
            tag: "chat-message",
            onClick: () => {
              router.push(`/chat?chatId=${payload?.message?.conversationId}`)
              console.log(payload, "payload")
            }
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

    joinConversationRooms();
    socket.on("connect", joinConversationRooms);
    socket.on("notification", onNotification);
    socket.on("receiveMessage", onReceiveMessage);
    socket.on("receiveBroadcastMessage", onReceiveBroadcastMessage);

    return () => {
      socket.off("connect", joinConversationRooms);
      socket.off("notification", onNotification);
      socket.off("receiveMessage", onReceiveMessage);
      socket.off("receiveBroadcastMessage", onReceiveBroadcastMessage);
    };
  }, [
    dispatch,
    userId,
    conversationsData,
    unreadMessagesCount,
    placeholders.new_notification,
    placeholders.new_message_from,
    placeholders.chat_title,
  ]);

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
      <div className="flex h-[calc(100dvh-60px)] min-h-0 w-full flex-col overflow-y-auto lg:h-screen">
        {children}
      </div>
    </div>
  );
}

export default Layout;
