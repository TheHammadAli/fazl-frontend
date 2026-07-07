"use client";

import React, { useState } from "react";
import Tabs from "../Ui/Tabs";
import { useDictionary } from "@/dictionaries/DictionaryProvider";
import { useRouter } from "next/navigation";
import OfferedServices from "./OfferedServices";
import BookedServices from "./BookedServices";
import { useGetUserServiceQuery } from "@/store/services/sellingService";
import { getCookie } from "cookies-next";
import { getUserId } from "@/utils/getUserId";

function ServiceListing() {
    const { placeholders } = useDictionary();
    const router = useRouter();
    const userId =getUserId();
    const { data: service } = useGetUserServiceQuery(userId, {
        skip: !userId,
    });
    const hasService = (service?.data?.length ?? 0) > 0;
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
                    {hasService
                        ? (placeholders["my_service" as keyof typeof placeholders] ?? "My service")
                        : (placeholders["create_your_service_profile" as keyof typeof placeholders] ?? "Create Your Service Profile")}
                </button>
            </div>

            <div className="flex flex-1 min-h-0 flex-col w-full min-w-0">
                {tabsComponents[activeTab]}
            </div>

        </div >
    );
}

export default ServiceListing;
