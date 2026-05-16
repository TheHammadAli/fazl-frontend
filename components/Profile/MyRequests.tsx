"use client";

import React, { useState } from "react";
import Image from "next/image";
import serviceImage from "@/assets/images/product-image.jpg";
import { useDictionary } from "@/dictionaries/DictionaryProvider";
import chevronIcon from "@/assets/icons/chevron.svg";

const REQUEST_FILTER_KEYS = ["sent", "new_offer", "accepted", "rejected"] as const;
type RequestFilterKey = (typeof REQUEST_FILTER_KEYS)[number];

type RequestCard = {
  id: number;
  title: string;
  receiver: string;
  price: string;
  date: string;
  status: "pending" | "accepted" | "rejected";
  filter: RequestFilterKey;
};

function MyRequests() {
  const { placeholders } = useDictionary();
  type PlaceholderKey = keyof typeof placeholders;

  const [activeFilter, setActiveFilter] = useState<RequestFilterKey>("sent");

  const requests: RequestCard[] = [
    {
      id: 1,
      title: "Home Deep Cleaning",
      receiver: "DeepCleaning",
      price: "Rs 100/hour",
      date: "Feb 15, 2025 - 2:30 PM",
      status: "pending",
      filter: "sent",
    },
    {
      id: 2,
      title: "English Teaching Expert",
      receiver: "Babar Khan",
      price: "Rs 100/hour",
      date: "Feb 19, 2025 - 3:15 PM",
      status: "accepted",
      filter: "accepted",
    },
    {
      id: 3,
      title: "Math Tuition Service",
      receiver: "Numan Tutor",
      price: "Rs 100/hour",
      date: "Feb 22, 2025 - 1:00 PM",
      status: "rejected",
      filter: "rejected",
    },
    {
      id: 4,
      title: "Home Plumbing Service",
      receiver: "Adeel Plumber",
      price: "Rs 100/hour",
      date: "Feb 24, 2025 - 11:30 AM",
      status: "pending",
      filter: "new_offer",
    },
  ];

  const visibleRequests = requests.filter((item) => item.filter === activeFilter);

  const getStatusClass = (status: RequestCard["status"]) => {
    if (status === "accepted") return "text-green-1";
    if (status === "rejected") return "text-red-1";
    return "text-gray-8";
  };

  const ph = (key: PlaceholderKey) => placeholders[key];
  return (
    <div className="h-full ">
      <div>
        <div className="border-b px-4 border-gray-9 flex items-center justify-center">
          <div className="h-[72px]   w-[522px]  flex items-center gap-2 text-[14px]">
            <span className="text-gray-11">{ph("profile")}</span>
            <Image src={chevronIcon} alt="chevron" className="ltr:rotate-180" />
            <span className="text-green-2">{ph("my_requests")}</span>
          </div>
        </div>
        <div className="flex justify-center px-4">
          <div className="w-[522px] pt-5 ">
            <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar">
              {REQUEST_FILTER_KEYS.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  className={`h-[34px] px-3 rounded-full border text-[14px] font-normal whitespace-nowrap cursor-pointer ${activeFilter === filter
                    ? "border-green-1 bg-green-4 text-black-1"
                    : "border-gray-2 bg-white text-black-1"
                    }`}
                >
                  {ph(filter)}
                </button>
              ))}
            </div>

            <div className="mt-4 max-w-[760px] bg-white">
              {visibleRequests.map((item) => (
                <div key={item.id} className="py-4 border-b border-gray-9">
                  <div
                    className=" flex flex-col sm:flex-row sm:items-start gap-3"
                  >
                    <Image
                      src={serviceImage}
                      alt={item.title}
                      className="w-[60px] h-[60px] rounded-[8px] object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <h3 className="text-[15px] font-medium leading-none text-black-1">
                        {item.title}
                      </h3>
                      <p className="text-[15px] font-normal mt-1 leading-none text-gray-8">
                        {ph("to_label")}: {item.receiver}
                      </p>
                      <p className="text-[14px] font-medium mt-1 leading-none text-green-1">
                        {item.price}
                      </p>

                    </div>
                  </div>
                  {activeFilter === "new_offer" && (
                    <p className="text-[15px] text-green-1 font-medium mt-4 leading-none">
                      {ph("proposed_new_time").replace("{name}", item.receiver)}
                    </p>
                  )}
                  <p className="text-[15px] font-medium mt-2 leading-none text-black-1">
                    {item.date}
                  </p>
                  <p
                    className={`text-[14px] font-normal text-[#4B514F] mt-2 leading-none ${getStatusClass(
                      item.status
                    )}`}
                  >
                    {ph(item.status)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

export default MyRequests;
