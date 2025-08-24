import React from "react";
import Sidebar from "./Sidebar";
import MobileHeader from "./MobileHeader";

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="lg:flex">
      <MobileHeader />
      <Sidebar />
      <div className="lg:h-screen w-full lg:overflow-y-scroll">{children}</div>
    </div>
  );
}

export default Layout;
