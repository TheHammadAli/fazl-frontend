"use client";

import React, { useState } from "react";
import Tabs from "../Ui/Tabs";
import { useDictionary } from "@/dictionaries/DictionaryProvider";
import { useRouter } from "next/navigation";
import OfferedServices from "./OfferedServices";
import BookedServices from "./BookedServices";

function ServiceListing() {
    const { placeholders } = useDictionary();
    const router = useRouter();
    const tabs = ["offered_service", "booked_services"];
    const [activeTab, setActiveTab] = useState<string>("offered_service");
    const tabsComponents: { [key: string]: React.ReactNode } = {
        offered_service: <OfferedServices />,
        booked_services: <BookedServices />,
    };
    return (
        <div className="flex flex-col min-h-screen w-full max-w-full min-w-0 overflow-x-hidden p-3 sm:p-4 lg:p-6" >
            <div className="border-b border-gray-9 flex flex-col gap-2 sm:gap-0 sm:flex-row sm:justify-between sm:items-center w-full min-w-0 shrink-0 pb-2 sm:pb-0">
                <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
                <button
                    type="button"
                    onClick={() => router.push("/services/my-service")}
                    className="self-start sm:self-auto font-medium text-[15px] cursor-pointer text-green-1 hover:underline"
                >
                    {placeholders["my_service" as keyof typeof placeholders] ?? "My service"}
                </button>
            </div>

            {tabsComponents[activeTab]}

        </div >
    );
}

export default ServiceListing;
