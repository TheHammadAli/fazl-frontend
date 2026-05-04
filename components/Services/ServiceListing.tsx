"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import { BeatLoader } from "react-spinners";
import Tabs from "../Ui/Tabs";
import { useDictionary } from "@/dictionaries/DictionaryProvider";
import { useRouter } from "next/navigation";
import { getCookie } from "cookies-next";
import { useGetServicesRequestsQuery, useUpdateServiceRequestMutation } from "@/store/services/sellingService";
import { formatRequestedDateTime } from "@/utils/formatRequestedDateTime";
import noImageAvtar from "@/assets/images/no-image-av.png";
import Modal from "../Ui/Modals/Modal";
import DateTimePickerModal from "./DateTimePickerModal";
import { toast } from "react-hot-toast";
import ServiceRequestSkeleton from "@/components/Services/ServiceRequestSkeleton";

const ONE_HOUR_MS = 60 * 60 * 1000;
const REQUEST_TAB_KEYS = [
    "service_request",
    "service_history",
    "my_offers",
] as const;
const STATUS_TAB_KEYS = ["incoming", "accepted", "rejected"] as const;

type RequestTabKey = (typeof REQUEST_TAB_KEYS)[number];
type StatusTabKey = (typeof STATUS_TAB_KEYS)[number];
/** Shape of each item from GET `/services/requests/:userId` (RTK query is untyped). */
type ServiceRequestItem = {
    id?: string;
    _id?: string;
    requestedDateTime?: string;
    service?: {
        title?: string;
        price?: string;
        paymentType?: string;
        images?: string[];
    };
    provider?: {
        id?: string;
        name?: string;
    };
    status?: string;
    customer?: {
        id?: string;
        name?: string;
    };

};

function getRequestId(request: ServiceRequestItem): string | undefined {
    return request.id ?? request._id;
}

type ServiceAction = "accept" | "reject" | "propose";

function ServiceListing() {
    const { placeholders, currentLanguage } = useDictionary();
    const modalRef = React.useRef<HTMLDivElement>(null);
    const [date, setDate] = useState<Date>(() => new Date(Date.now() + ONE_HOUR_MS));
    const router = useRouter();
    type PlaceholderKey = keyof typeof placeholders;
    const [userId, setUserId] = useState<string | undefined>(undefined);
    const [isHydrated, setIsHydrated] = useState(false);
    const tabs = ["offered_service", "booked_services"];
    const [activeTab, setActiveTab] = useState<string>("offered_service");
    const [activeRequestTab, setActiveRequestTab] =
        useState<RequestTabKey>("service_request");
    const [activeStatusTab, setActiveStatusTab] =
        useState<StatusTabKey>("incoming");
    const ph = (key: PlaceholderKey) => placeholders[key];
    const [offerForId, setOfferForId] = useState<string | null>(null);

    useEffect(() => {
        const id = getCookie("userId");
        setUserId(typeof id === "string" ? id : undefined);
        setIsHydrated(true);
    }, []);
    const { data: servicesRequests, isLoading, isFetching } = useGetServicesRequestsQuery({ id: userId, page: 1, limit: 100 }, { skip: !userId || activeTab === "booked_services" });
    const [spinnerIndex, setSpinnerIndex] = useState<number>(-1);
    const [spinnerAction, setSpinnerAction] = useState<ServiceAction | null>(null);
    const [updateServiceRequest, { isLoading: isUpdating }] = useUpdateServiceRequestMutation();
    const [filteredServicesRequests, setFilteredServicesRequests] = useState<ServiceRequestItem[]>([]);

    const handleUpdateServiceRequest = (
        {
            requestId,
            date,
            action,
        }: {
            requestId: string;
            date?: Date;
            action: ServiceAction;
        }
    ) => {

        try {
            updateServiceRequest({
                requestId: requestId,
                ...(action === "propose" && { proposedDateTime: date?.toISOString() }),
                action: action,
            }).unwrap().then((res) => {
                console.log(res);
            });


        } catch (err) {
            const errorData = err as { data?: { message?: string } };
            toast.error(errorData?.data?.message ?? "Something went wrong");
        }
    };

    useEffect(() => {
        if (!servicesRequests?.data) return;
        const filtered = servicesRequests.data
            .filter((request: ServiceRequestItem) => request.provider?.id === userId)
            .filter((request: ServiceRequestItem) => {
                if (activeRequestTab === "my_offers") {
                    return request.status === "pending";
                }
                if (activeRequestTab === "service_history") {
                    return request.status === "accepted" || request.status === "rejected";
                }
                if (activeStatusTab === "incoming") return request.status === "pending";
                if (activeStatusTab === "accepted") return request.status === "accepted";
                return request.status === "rejected";
            });
        setFilteredServicesRequests(filtered);
    }, [servicesRequests, activeRequestTab, activeStatusTab, userId]);
    return (
        <div className="flex flex-col min-h-screen  w-full max-w-full min-w-0 overflow-x-hidden p-3 sm:p-4 lg:p-6">
            <Modal
                editModalRef={modalRef}
                open={offerForId !== null}
                setOpen={(v) => {
                    const next = typeof v === "function" ? v(offerForId !== null) : v;
                    if (!next) setOfferForId(null);
                }}
                centered={true}
            >
                <DateTimePickerModal
                    setOpenPciker={() => setOfferForId(null)}
                    date={date}
                    isOfferingTime={true}
                    isLoading={isUpdating && spinnerAction === "propose"}
                    setStep={() => { }}
                    setDate={setDate}
                    onConfirm={() => {
                        handleUpdateServiceRequest({
                            requestId: offerForId ?? "",
                            action: "propose",
                            date: date
                        });
                    }}
                />
            </Modal>
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

            <div className="flex flex-col lg:flex-row flex-1 min-h-0 w-full min-w-0 lg:max-h-[calc(115dvh-210px)]">
                <div className="w-full shrink-0 lg:w-[min(340px,100%)] lg:max-w-full lg:border-r border-gray-9 bg-white pt-3 sm:pt-4 border-b lg:border-b-0 flex flex-col lg:min-h-0 lg:overflow-y-auto">
                    <div className="py-3 sm:py-4 flex gap-2 overflow-x-auto hide-scrollbar min-w-0">
                        {REQUEST_TAB_KEYS.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveRequestTab(tab)}
                                className={`h-[34px] px-3 rounded-full border border-gray-2 text-[13px] font-normal text-black-1 cursor-pointer whitespace-nowrap ${activeRequestTab === tab
                                    ? "border-green-1 bg-green-4"
                                    : "bg-white"
                                    }`}
                            >
                                {ph(tab)}
                            </button>
                        ))}
                    </div>

                    {activeRequestTab === "service_request" && (
                        <div className="pt-2">
                            {STATUS_TAB_KEYS.map((tab) => (
                                <button
                                    key={tab}
                                    type="button"
                                    onClick={() => setActiveStatusTab(tab)}
                                    className={`w-full h-[48px] px-5 ltr:text-left rtl:text-right text-[15px] font-medium text-black-1 leading-none cursor-pointer ${activeStatusTab === tab ? "bg-green-4" : ""
                                        }`}
                                >
                                    {ph(tab)}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex-1 min-w-0 bg-white flex flex-col lg:min-h-0">
                    <div className="px-3 sm:px-4 lg:px-6 pt-3 sm:pt-4 flex-1 min-h-0 overflow-y-auto ">
                        {(!isHydrated || isLoading || isFetching) ? (
                            <ServiceRequestSkeleton count={4} />
                        ) : filteredServicesRequests.length === 0 ? (
                            <p className="py-8 text-center text-[15px] font-medium text-gray-8">
                                {ph("no_data_available")}
                            </p>
                        ) : (
                            filteredServicesRequests.map((request, index) => {
                                return (
                                    <div
                                        key={index}
                                        className="py-4 border-b border-gray-9 flex flex-col xl:flex-row lg:items-start lg:justify-between gap-4 lg:gap-4 w-full min-w-0"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-start gap-3 min-w-0">
                                                <Image
                                                    src={request?.service?.images?.[0] ?? noImageAvtar}
                                                    alt={"image"}
                                                    width={60}
                                                    height={60}
                                                    className="w-[60px] bg-gray-5 h-[60px] shrink-0 rounded-[8px] object-cover"
                                                    unoptimized
                                                />
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="text-[15px] font-medium text-black-1 leading-snug break-words">
                                                        {request?.service?.title}
                                                    </h3>
                                                    <p className="text-[15px] font-normal leading-snug mt-1 text-gray-8 break-words">
                                                        {ph("from_label")}: {request?.customer?.name}
                                                    </p>
                                                    <p className="text-[14px] font-medium leading-snug mt-1 text-green-2 break-words">
                                                        {request?.service?.price}/{request?.service?.paymentType === "hourly" ? ph("fixed") : ph("fixed")}
                                                    </p>
                                                </div>
                                            </div>

                                            <p className="text-[15px] font-medium mt-1 leading-snug text-black-1 break-words">
                                                {/* {ph(offer.dateKey)} */}

                                                {formatRequestedDateTime(
                                                    request?.requestedDateTime,
                                                    currentLanguage
                                                )}
                                            </p>
                                            <p
                                                className={`text-[14px] mt-2 leading-snug ${request?.status === "accepted"
                                                    ? "text-green-1"
                                                    : request?.status === "rejected"
                                                        ? "text-red-1"
                                                        : request?.status === "proposed" ? "text-[#3C9197]" : "text-[#4B514F]"
                                                    }`}
                                            >
                                                {request?.status === "accepted"
                                                    ? ph("accepted")
                                                    : request?.status === "rejected"
                                                        ? ph("rejected")
                                                        : request?.status === "proposed"
                                                            ? ph("you_offered_a_new_time")
                                                            : ph("pending")}
                                            </p>

                                        </div>

                                        {(activeRequestTab === "service_request" && activeStatusTab === "incoming") || (activeRequestTab === "my_offers") && <div className="w-full shrink-0 xl:w-[297px] lg:max-w-full">
                                            <button
                                                type="button"
                                                disabled={isUpdating && spinnerAction === "accept"}
                                                onClick={() => {
                                                    const requestId = getRequestId(request);
                                                    setSpinnerIndex(index);
                                                    setSpinnerAction("accept");
                                                    handleUpdateServiceRequest({
                                                        requestId: requestId ?? "",
                                                        action: "accept"
                                                    });
                                                }}
                                                className="w-full h-[42px] rounded-[6px] bg-green-1 text-white text-[14px] font-normal cursor-pointer disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center"
                                            >

                                                {isUpdating && spinnerAction === "accept" && spinnerIndex === index ? <BeatLoader color="white" size={8} /> : ph("accept")}

                                            </button>
                                            <div className="mt-2 flex items-center gap-[9px]">
                                                <button
                                                    type="button"
                                                    disabled={isUpdating && spinnerAction === "reject"}
                                                    onClick={() => {
                                                        const requestId = getRequestId(request) || "";
                                                        setSpinnerIndex(index);
                                                        setSpinnerAction("reject");
                                                        handleUpdateServiceRequest({
                                                            requestId: requestId,
                                                            action: "reject"
                                                        });

                                                    }}
                                                    className="w-1/2 md:w-[144px] lg:w-1/2 xl:w-[144px] h-[42px] rounded-[6px] border border-green-2 text-green-2 text-[14px] font-normal cursor-pointer disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center"
                                                >

                                                    {isUpdating && spinnerAction === "reject" && spinnerIndex === index ? <BeatLoader color="white" size={8} /> : ph("decline")}

                                                </button>
                                                <button
                                                    disabled={isUpdating && spinnerAction === "propose"}

                                                    onClick={() => {
                                                        const requestId = getRequestId(request) || "";
                                                        setSpinnerIndex(index);
                                                        setSpinnerAction("propose");
                                                        setOfferForId(requestId);
                                                    }}
                                                    type="button"
                                                    className="w-1/2 md:w-[144px] lg:w-1/2 xl:w-[144px] h-[42px] rounded-[6px] border border-green-2 text-green-2 text-[14px] font-normal cursor-pointer disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center"
                                                >

                                                    {ph("offer_new_time")}

                                                </button>
                                            </div>
                                        </div>}

                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ServiceListing;
