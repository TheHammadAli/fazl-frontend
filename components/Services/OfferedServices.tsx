"use client";

import Image from "next/image";
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { BeatLoader } from "react-spinners";
import { useDictionary } from "@/dictionaries/DictionaryProvider";
import { getCookie } from "cookies-next";
import {
    useGetServicesRequestsQuery,
    useUpdateServiceRequestMutation,
} from "@/store/services/sellingService";
import { formatRequestedDateTime } from "@/utils/formatRequestedDateTime";
import noImageAvtar from "@/assets/images/no-image-av.png";
import Modal from "../Ui/Modals/Modal";
import DateTimePickerModal from "./DateTimePickerModal";
import { toast } from "react-hot-toast";
import ServiceRequestSkeleton from "@/components/Services/ServiceRequestSkeleton";
import { parsePositiveInt } from "../Updates/Notifications";

const ONE_HOUR_MS = 60 * 60 * 1000;
const PAGE_LIMIT = 10;
const SCROLL_LOAD_MARGIN_PX = 200;

const REQUEST_TAB_KEYS = [
    "service_request",
    "service_history",
    "my_offers",
] as const;
const STATUS_TAB_KEYS = ["incoming", "accepted", "rejected"] as const;

type RequestTabKey = (typeof REQUEST_TAB_KEYS)[number];
type StatusTabKey = (typeof STATUS_TAB_KEYS)[number];

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

type ServiceAction = "accept" | "reject" | "propose";

const REQUEST_FILTER_QUERY: Record<
    StatusTabKey,
    { status: string; jobStatus?: string }
> = {
    incoming: { status: "pending" },
    accepted: { status: "accepted" },
    rejected: { status: "rejected" },
};

function getRequestId(request: ServiceRequestItem): string | undefined {
    return request.id ?? request._id;
}

function mergeRequests(
    prev: ServiceRequestItem[],
    incoming: ServiceRequestItem[],
    page: number,
): ServiceRequestItem[] {
    if (page === 1) return incoming;
    const seen = new Set(prev.map((item) => item._id ?? item.id));
    const next = [...prev];
    for (const item of incoming) {
        const key = item._id ?? item.id;
        if (key && !seen.has(key)) {
            seen.add(key);
            next.push(item);
        }
    }
    return next;
}

function getScrollParent(node: HTMLElement): HTMLElement | Window {
    let parent = node.parentElement;
    while (parent) {
        const { overflowY } = window.getComputedStyle(parent);
        if (/(auto|scroll|overlay)/.test(overflowY)) {
            return parent;
        }
        parent = parent.parentElement;
    }
    return window;
}

function isSentinelVisible(sentinel: HTMLDivElement | null): boolean {
    if (!sentinel) return false;
    const rect = sentinel.getBoundingClientRect();
    const viewportBottom =
        window.innerHeight || document.documentElement.clientHeight;
    return rect.top <= viewportBottom + SCROLL_LOAD_MARGIN_PX;
}

function OfferedServices() {
    const { placeholders, currentLanguage } = useDictionary();
    const modalRef = React.useRef<HTMLDivElement>(null);
    const [date, setDate] = useState<Date>(
        () => new Date(Date.now() + ONE_HOUR_MS),
    );
    type PlaceholderKey = keyof typeof placeholders;
    const [userId, setUserId] = useState<string | undefined>(undefined);
    const [isHydrated, setIsHydrated] = useState(false);
    const [activeRequestTab, setActiveRequestTab] =
        useState<RequestTabKey>("service_request");
    const [activeStatusTab, setActiveStatusTab] =
        useState<StatusTabKey>("incoming");
    const [page, setPage] = useState(1);
    const [requestItems, setRequestItems] = useState<ServiceRequestItem[]>([]);
    const [hasMore, setHasMore] = useState(true);
    const ph = (key: PlaceholderKey) => placeholders[key];
    const [offerForId, setOfferForId] = useState<string | null>(null);

    const sentinelRef = useRef<HTMLDivElement>(null);
    const [sentinelReady, setSentinelReady] = useState(false);
    const lastMergedKeyRef = useRef("");
    const maxRequestedPageRef = useRef(1);

    useEffect(() => {
        const id = getCookie("userId");
        setUserId(typeof id === "string" ? id : undefined);
        setIsHydrated(true);
    }, []);

    const requestQueryParams = useMemo(() => {
        if (activeRequestTab === "service_history") {
            return {};
        }
        if (activeRequestTab === "my_offers") {
            return REQUEST_FILTER_QUERY.incoming;
        }
        return REQUEST_FILTER_QUERY[activeStatusTab];
    }, [activeRequestTab, activeStatusTab]);

    const {
        data: servicesRequests,
        isLoading,
        isFetching,
        fulfilledTimeStamp,
    } = useGetServicesRequestsQuery(
        {
            id: userId,
            page,
            limit: PAGE_LIMIT,
            ...requestQueryParams,
        },
        { skip: !userId, refetchOnMountOrArgChange: true },
    );

    const [spinnerIndex, setSpinnerIndex] = useState<number>(-1);
    const [spinnerAction, setSpinnerAction] = useState<ServiceAction | null>(
        null,
    );
    const [updateServiceRequest, { isLoading: isUpdating }] =
        useUpdateServiceRequestMutation();

    const isInitialLoading =
        !isHydrated || (requestItems.length === 0 && (isLoading || isFetching));
    const isLoadingMore = isFetching && page > 1;
    const showEmpty = isHydrated && !isInitialLoading && requestItems.length === 0;

    const resetPagination = useCallback(() => {
        setPage(1);
        setRequestItems([]);
        setHasMore(true);
        lastMergedKeyRef.current = "";
        maxRequestedPageRef.current = 1;
    }, []);

    useEffect(() => {
        resetPagination();
    }, [activeRequestTab, activeStatusTab, resetPagination]);

    useEffect(() => {
        if (servicesRequests == null || isFetching || !userId) return;

        const incoming = (
            (servicesRequests?.data as ServiceRequestItem[] | undefined) ?? []
        ).filter((request) => request.provider?.id === userId);

        const mergeKey = `${activeRequestTab}-${activeStatusTab}-${page}-${fulfilledTimeStamp ?? 0}`;
        if (lastMergedKeyRef.current === mergeKey) return;
        lastMergedKeyRef.current = mergeKey;

        setRequestItems((prev) => {
            const next = mergeRequests(prev, incoming, page);
            const totalPages = parsePositiveInt(servicesRequests?.meta?.totalPages);
            const total = parsePositiveInt(servicesRequests?.meta?.total);
            setHasMore(
                totalPages != null
                    ? page < totalPages
                    : total != null
                      ? next.length < total
                      : incoming.length >= PAGE_LIMIT,
            );
            return next;
        });
    }, [
        servicesRequests,
        page,
        isFetching,
        userId,
        activeRequestTab,
        activeStatusTab,
        fulfilledTimeStamp,
    ]);

    const requestNextPage = useCallback(() => {
        if (!userId || isFetching || !hasMore || requestItems.length === 0) return;

        const nextPage = page + 1;
        if (maxRequestedPageRef.current >= nextPage) return;

        maxRequestedPageRef.current = nextPage;
        setPage(nextPage);
    }, [userId, isFetching, hasMore, requestItems.length, page]);

    const tryLoadFromScroll = useCallback(() => {
        if (!isSentinelVisible(sentinelRef.current)) return;
        requestNextPage();
    }, [requestNextPage]);

    const setSentinelNode = useCallback((node: HTMLDivElement | null) => {
        sentinelRef.current = node;
        setSentinelReady(!!node);
    }, []);

    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinelReady || !sentinel || !hasMore) return;

        const scrollRoot = getScrollParent(sentinel);
        let ticking = false;

        const onScroll = () => {
            if (ticking) return;
            ticking = true;
            window.requestAnimationFrame(() => {
                ticking = false;
                tryLoadFromScroll();
            });
        };

        scrollRoot.addEventListener("scroll", onScroll, { passive: true });
        return () => scrollRoot.removeEventListener("scroll", onScroll);
    }, [tryLoadFromScroll, hasMore, sentinelReady]);

    const handleUpdateServiceRequest = ({
        requestId,
        date,
        action,
    }: {
        requestId: string;
        date?: Date;
        action: ServiceAction;
    }) => {
        try {
            updateServiceRequest({
                requestId,
                ...(action === "propose" && { proposedDateTime: date?.toISOString() }),
                action,
            })
                .unwrap()
                .then(() => {
                    resetPagination();
                })
                .catch((err: { data?: { message?: string } }) => {
                    toast.error(err?.data?.message ?? "Something went wrong");
                });
        } catch (err) {
            const errorData = err as { data?: { message?: string } };
            toast.error(errorData?.data?.message ?? "Something went wrong");
        }
    };

    const showRequestActions =
        (activeRequestTab === "service_request" &&
            activeStatusTab === "incoming") ||
        activeRequestTab === "my_offers";

    return (
        <>
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
                            date,
                        });
                    }}
                />
            </Modal>

            <div className="flex flex-col lg:flex-row flex-1 min-h-0 w-full min-w-0 lg:max-h-[calc(115dvh-210px)]">
                <div className="w-full shrink-0 lg:w-[min(340px,100%)] lg:max-w-full lg:border-r border-gray-9 bg-white pt-3 sm:pt-4 border-b lg:border-b-0 flex flex-col lg:min-h-0 lg:overflow-y-auto">
                    <div className="py-3 sm:py-4 flex gap-2 overflow-x-auto hide-scrollbar min-w-0">
                        {REQUEST_TAB_KEYS.map((tab) => (
                            <button
                                key={tab}
                                type="button"
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
                    <div className="px-3 sm:px-4 lg:px-6 pt-3 sm:pt-4 flex-1 min-h-0 overflow-y-auto">
                        {isInitialLoading ? (
                            <ServiceRequestSkeleton count={4} />
                        ) : showEmpty ? (
                            <p className="py-8 text-center text-[15px] font-medium text-gray-8">
                                {ph("no_data_available")}
                            </p>
                        ) : (
                            <>
                                {requestItems.map((request: ServiceRequestItem, index: number) => {
                                    const requestId = getRequestId(request) ?? "";
                                    return (
                                        <div
                                            key={requestId || index}
                                            className="py-4 border-b border-gray-9 flex flex-col xl:flex-row lg:items-start lg:justify-between gap-4 lg:gap-4 w-full min-w-0"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-start gap-3 min-w-0">
                                                    <Image
                                                        src={request?.service?.images?.[0] ?? noImageAvtar}
                                                        alt=""
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
                                                            {request?.service?.price}/
                                                            {request?.service?.paymentType === "hourly"
                                                                ? ph("fixed")
                                                                : ph("fixed")}
                                                        </p>
                                                    </div>
                                                </div>

                                                <p className="text-[15px] font-medium mt-1 leading-snug text-black-1 break-words">
                                                    {formatRequestedDateTime(
                                                        request?.requestedDateTime,
                                                        currentLanguage,
                                                    )}
                                                </p>
                                                <p
                                                    className={`text-[14px] mt-2 leading-snug ${request?.status === "accepted"
                                                        ? "text-green-1"
                                                        : request?.status === "rejected"
                                                            ? "text-red-1"
                                                            : request?.status === "proposed"
                                                                ? "text-[#3C9197]"
                                                                : "text-[#4B514F]"
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

                                            {showRequestActions && (
                                                <div className="w-full shrink-0 xl:w-[297px] lg:max-w-full">
                                                    <button
                                                        type="button"
                                                        disabled={isUpdating && spinnerAction === "accept"}
                                                        onClick={() => {
                                                            setSpinnerIndex(index);
                                                            setSpinnerAction("accept");
                                                            handleUpdateServiceRequest({
                                                                requestId,
                                                                action: "accept",
                                                            });
                                                        }}
                                                        className="w-full h-[42px] rounded-[6px] bg-green-1 text-white text-[14px] font-normal cursor-pointer disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center"
                                                    >
                                                        {isUpdating &&
                                                            spinnerAction === "accept" &&
                                                            spinnerIndex === index ? (
                                                            <BeatLoader color="white" size={8} />
                                                        ) : (
                                                            ph("accept")
                                                        )}
                                                    </button>
                                                    <div className="mt-2 flex items-center gap-[9px]">
                                                        <button
                                                            type="button"
                                                            disabled={isUpdating && spinnerAction === "reject"}
                                                            onClick={() => {
                                                                setSpinnerIndex(index);
                                                                setSpinnerAction("reject");
                                                                handleUpdateServiceRequest({
                                                                    requestId,
                                                                    action: "reject",
                                                                });
                                                            }}
                                                            className="w-1/2 md:w-[144px] lg:w-1/2 xl:w-[144px] h-[42px] rounded-[6px] border border-green-2 text-green-2 text-[14px] font-normal cursor-pointer disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center"
                                                        >
                                                            {isUpdating &&
                                                                spinnerAction === "reject" &&
                                                                spinnerIndex === index ? (
                                                                <BeatLoader color="white" size={8} />
                                                            ) : (
                                                                ph("decline")
                                                            )}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            disabled={isUpdating && spinnerAction === "propose"}
                                                            onClick={() => {
                                                                setSpinnerIndex(index);
                                                                setSpinnerAction("propose");
                                                                setOfferForId(requestId);
                                                            }}
                                                            className="w-1/2 md:w-[144px] lg:w-1/2 xl:w-[144px] h-[42px] rounded-[6px] border border-green-2 text-green-2 text-[14px] font-normal cursor-pointer disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center"
                                                        >
                                                            {ph("offer_new_time")}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                                {hasMore ? (
                                    <div
                                        ref={setSentinelNode}
                                        className="h-4 w-full shrink-0"
                                        aria-hidden
                                    />
                                ) : null}
                                {isLoadingMore ? (
                                    <div className="flex justify-center py-6">
                                        <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-gray-4 border-t-green-1" />
                                    </div>
                                ) : null}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default OfferedServices;
