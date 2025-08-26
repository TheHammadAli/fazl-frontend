import { useDictionary } from "@/dictionaries/DictionaryProvider";
import React from "react";
interface TabsProps {
  tabs: string[];
  activeTab: string;
  setActiveTab: (value: string) => void;
}

function Tabs({ tabs, activeTab, setActiveTab }: TabsProps) {
  const { placeholders } = useDictionary();
  type PlaceholderKey = keyof typeof placeholders;

  return (
    <div className="flex ">
      {tabs?.map((tab) => {
        return (
          <div
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`h-[38px] -mb-[1px] flex items-center px-[14px] text-[14px] cursor-pointer  border-b-[2px] transition-all ${
              tab === activeTab
                ? "font-medium text-green-1 border-green-1"
                : "font-normal text-gray-8 border-transparent"
            }`}
          >
            {placeholders[tab as PlaceholderKey]}
          </div>
        );
      })}
    </div>
  );
}

export default Tabs;
