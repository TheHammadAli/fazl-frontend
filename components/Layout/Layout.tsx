"use client";
import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import MobileHeader from "./MobileHeader";
import { useGetUnreadNotificationsCountQuery } from "@/store/services/notificationService";
import { getUserId } from "@/utils/getUserId";
import { useAppDispatch } from "@/store/store";
import { baseApi } from "@/store/baseApi";
import { initializeSocket } from "@/utils/socket";

function Layout({ children }: { children: React.ReactNode }) {
  const [openSidebar, setOpenSidebar] = useState(false);
  const userId = getUserId();
  const [readCount, setReadCount] = useState(0);
  const { data: unreadNotificationsCount } = useGetUnreadNotificationsCountQuery(userId, { skip: !userId });
  const dispatch = useAppDispatch();
  useEffect(() => {
    setReadCount(unreadNotificationsCount?.data?.count || 0);
  }, [unreadNotificationsCount?.data?.count]);

  useEffect(() => {
    const socket = initializeSocket();
    if (!socket) return;
    socket.on("notification", (data) => {
      console.log(data, "here is the data of the notification");
      dispatch(baseApi.util.invalidateTags(["NOTIFICATIONS"]));
    });
  }, [dispatch]);

  return (
    <div className="lg:flex">
      <MobileHeader unreadCount={readCount} openSidebar={openSidebar} setOpenSidebar={setOpenSidebar} />
      <Sidebar unreadCount={readCount} setReadCount={setReadCount} openSidebar={openSidebar} setOpenSidebar={setOpenSidebar} />
      <div className="lg:h-screen w-full lg:overflow-y-scroll">{children}</div>
    </div>
  );
}

export default Layout;
