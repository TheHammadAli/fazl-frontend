"use client";
import React, { useState } from "react";
import Tabs from "../Ui/Tabs";
import { useDictionary } from "@/dictionaries/DictionaryProvider";
import { useRouter } from "next/navigation";
import PrivateListings from "./PrivateListings";
import MyShops from "./MyShops";

function Selling() {
  const tabs = ["my_shops", "private_listing"];
  const [activeTab, setActiveTab] = useState<string>(tabs[0]);
  const { placeholders } = useDictionary();
  const router = useRouter();
  const tabsComponents: { [key: string]: React.ReactNode } = {
    my_shops: <MyShops />,
    private_listing: <PrivateListings />,
  };

  return (
    <div className="p-6">
      <div className="border-b-[1px] border-gray-9 flex justify-between items-center  w-full">
        <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
        <div
          className="font-normal text-[13px] cursor-pointer text-green-2 hover:underline"
          onClick={() => router.push("/selling/create-shop")}
        >
          {placeholders.create_shop}
        </div>
      </div>
      <div>{tabsComponents[activeTab]}</div>
    </div>
  );
}

export default Selling;
