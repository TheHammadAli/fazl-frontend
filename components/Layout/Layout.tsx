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

function Layout({ children }: { children: React.ReactNode }) {
  const [openSidebar, setOpenSidebar] = useState(false);
  const userId = getUserId();
  const [readCount, setReadCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const { data: unreadNotificationsCount } = useGetUnreadNotificationsCountQuery(userId, { skip: !userId });
  const { data: unreadMessagesCount } = useUnreadMessagesCountQuery({ userId: userId ?? "" }, { skip: !userId });
  const dispatch = useAppDispatch();
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
    socket.on("notification", (data) => {
      dispatch(baseApi.util.invalidateTags(["NOTIFICATIONS"]));
    });
    socket.on("receiveMessage", (data) => {
      dispatch(baseApi.util.invalidateTags(["Chat"]));
    });
  }, [dispatch]);

  return (
    <div className="lg:flex">
      <MobileHeader unreadMessages={unreadMessages} unreadCount={readCount} openSidebar={openSidebar} setOpenSidebar={setOpenSidebar} />
      <Sidebar unreadMessages={unreadMessages} unreadCount={readCount} setUnreadMessages={setUnreadMessages} setReadCount={setReadCount} openSidebar={openSidebar} setOpenSidebar={setOpenSidebar} />
      <div className="lg:h-screen w-full lg:overflow-y-scroll">{children}</div>
    </div>
  );
}

export default Layout;
