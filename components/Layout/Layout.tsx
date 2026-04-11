"use client";
import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import MobileHeader from "./MobileHeader";
import { useGetUnreadNotificationsCountQuery } from "@/store/services/notificationService";
import { getUserId } from "@/utils/getUserId";

function Layout({ children }: { children: React.ReactNode }) {
  const [openSidebar, setOpenSidebar] = useState(false);
  const userId = getUserId();
  const [readCount, setReadCount] = useState(0);
  const { data: unreadNotificationsCount } = useGetUnreadNotificationsCountQuery(userId, { skip: !userId });
  useEffect(() => {
    setReadCount(unreadNotificationsCount?.data?.count || 0);
  }, [unreadNotificationsCount?.data?.count]);
  return (
    <div className="lg:flex">
      <MobileHeader unreadCount={readCount} openSidebar={openSidebar} setOpenSidebar={setOpenSidebar} />
      <Sidebar unreadCount={readCount} setReadCount={setReadCount} openSidebar={openSidebar} setOpenSidebar={setOpenSidebar} />
      <div className="lg:h-screen w-full lg:overflow-y-scroll">{children}</div>
    </div>
  );
}

export default Layout;
