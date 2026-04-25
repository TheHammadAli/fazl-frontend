"use client";
import React, { useState } from "react";
import Navigations from "./Navigations";
import cartIcon from "@/assets/icons/my-cart.svg";
import ordersIcon from "@/assets/icons/my-orders.svg";
import requestsIcon from "@/assets/icons/my-requests.svg";
import jobsIcon from "@/assets/icons/my-jobs.svg";
import broadcastMessagesIcon from "@/assets/icons/broadcast.svg";
import MyCart from "./MyCart";
import MyOrders from "./MyOrders";
import MyRequests from "./MyRequests";
import MyJobs from "./MyJobs";
import Settings from "./Settings";
import ProfileInfo from "./ProfileInfo";

type tabsComponentsTypes = {
  my_cart: React.JSX.Element;
  my_orders: React.JSX.Element;
  my_requests: React.JSX.Element;
  my_jobs: React.JSX.Element;
  settings: React.JSX.Element;
  profile_info: React.JSX.Element;
};
type TabKeys = keyof tabsComponentsTypes;

function Profile() {
  const [toggle, setToggle] = useState<boolean>(false);
  const tabs = [
    { title: "my_cart", icon: cartIcon },
    { title: "my_orders", icon: ordersIcon },
    { title: "my_requests", icon: requestsIcon },
    { title: "my_jobs", icon: jobsIcon },
    { title: "broadcast_messages", icon: broadcastMessagesIcon },
  ];

  const tabsComponents: tabsComponentsTypes = {
    my_cart: <MyCart />,
    my_orders: <MyOrders />,
    my_requests: <MyRequests />,
    my_jobs: <MyJobs />,
    settings: <Settings />,
    profile_info: <ProfileInfo toggle={toggle} setToggle={setToggle} />,
  };

  const [selectedTab, setSelectedTab] = useState<string>("profile_info");
  return (
    <div className="flex w-full max-w-full flex-1 flex-col min-h-[calc(100dvh-5rem)] md:min-h-0 md:flex-row lg:min-h-0 lg:h-full">
      <div
        className={`w-full shrink-0 overflow-y-auto md:w-auto md:overflow-visible ${toggle && "hidden md:block"
          }`}
      >
        <Navigations
          toggle={toggle}
          setToggle={setToggle}
          tabs={tabs}
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
        />
      </div>

      <div
        className={`flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto lg:overflow-visible ${!toggle && "hidden md:block"
          }`}
      >
        {tabsComponents[selectedTab as TabKeys]}
      </div>
    </div>
  );
}

export default Profile;
