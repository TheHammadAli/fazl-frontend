"use client";
import React, { useState } from "react";
import Navigations from "./Navigations";
import cartIcon from "@/assets/icons/my-cart.svg";
import ordersIcon from "@/assets/icons/my-orders.svg";
import requestsIcon from "@/assets/icons/my-requests.svg";
import jobsIcon from "@/assets/icons/my-jobs.svg";
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
    <div className="w-full flex h-full ">
      <div className={`h-full w-full md:w-auto ${toggle && "hidden md:block"}`}>
        <Navigations
          toggle={toggle}
          setToggle={setToggle}
          tabs={tabs}
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
        />
      </div>

      <div className={`flex-1 ${!toggle && "hidden  md:block"}`}>
        {tabsComponents[selectedTab as TabKeys]}
      </div>
    </div>
  );
}

export default Profile;
