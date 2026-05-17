"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import chevron from "@/assets/icons/chev-down-icon.svg";
import chevronIcon from "@/assets/icons/chevron.svg";
import noImageAvtar from "@/assets/images/no-image-av.png";
import { useDictionary } from "@/dictionaries/DictionaryProvider";
import {
  useGetOrdersByBuyerQuery,
  useGetOrdersByOwnerQuery,
} from "@/store/services/sellingService";
import { getUserId } from "@/utils/getUserId";
import Tabs from "../Ui/Tabs";
import { parsePositiveInt } from "../Updates/Notifications";
import { useRouter } from "next/navigation";

const PAGE_LIMIT = 15;

const ORDER_STATUS_KEYS = [
  "all",
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
] as const;

type OrderStatusKey = (typeof ORDER_STATUS_KEYS)[number];
type OrderTypeKey = "sold" | "bought";

type CustomerOrder = {
  _id?: string;
  id?: string;
  status: string;
  product: {
    title: string;
    price: number | string;
    images: string[];
  } | null;
};

function mergeOrders(
  prev: CustomerOrder[],
  incoming: CustomerOrder[],
  page: number,
): CustomerOrder[] {
  if (page === 1) return incoming;
  const seen = new Set(prev.map((order) => order._id ?? order.id));
  const next = [...prev];
  for (const order of incoming) {
    const key = order._id ?? order.id;
    if (key && !seen.has(key)) {
      seen.add(key);
      next.push(order);
    }
  }
  return next;
}

function MyOrders() {
  const userId = getUserId() ?? "";
  const { tabs, placeholders, error_messages } = useDictionary();
  const listRef = useRef<HTMLDivElement>(null);
  const lastMergedKeyRef = useRef("");
  const isLoadingNextPageRef = useRef(false);
  const router = useRouter();
  const orderTypes = useMemo(
    () => [
      { title: placeholders.sold, key: "sold" as const },
      { title: placeholders.bought, key: "bought" as const },
    ],
    [placeholders.sold, placeholders.bought],
  );

  const [activeOrderType, setActiveOrderType] = useState<OrderTypeKey>("sold");
  const [activeStatus, setActiveStatus] = useState<OrderStatusKey>("all");
  const [page, setPage] = useState(1);
  const [orderItems, setOrderItems] = useState<CustomerOrder[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const isBought = activeOrderType === "bought";

  const {
    data: buyerOrders,
    isLoading: isBuyerLoading,
    isFetching: isBuyerFetching,
    fulfilledTimeStamp: buyerFulfilledTimeStamp,
  } = useGetOrdersByBuyerQuery(
    { buyerId: userId, page, limit: PAGE_LIMIT, ...(activeStatus !== "all" && { status: activeStatus }) },
    { skip: !userId || !isBought, refetchOnMountOrArgChange: true },
  );

  const {
    data: ownerOrders,
    isLoading: isOwnerLoading,
    isFetching: isOwnerFetching,
    fulfilledTimeStamp: ownerFulfilledTimeStamp,
  } = useGetOrdersByOwnerQuery(
    { ownerId: userId, ownerModel: "User", page, limit: PAGE_LIMIT, ...(activeStatus !== "all" && { status: activeStatus }) },
    { skip: !userId || isBought, refetchOnMountOrArgChange: true },
  );

  const activeResponse = isBought ? buyerOrders : ownerOrders;
  const isLoading = isBought ? isBuyerLoading : isOwnerLoading;
  const isFetching = isBought ? isBuyerFetching : isOwnerFetching;
  const fulfilledTimeStamp = isBought
    ? buyerFulfilledTimeStamp
    : ownerFulfilledTimeStamp;
  const count = isBought ? buyerOrders?.meta?.total ?? 0 : ownerOrders?.meta?.total ?? 0;


  useEffect(() => {
    setPage(1);
    setOrderItems([]);
    setHasMore(true);
    setActiveStatus("all");
    lastMergedKeyRef.current = "";
    isLoadingNextPageRef.current = false;
  }, [activeOrderType]);

  useEffect(() => {
    if (activeResponse == null || isFetching) return;

    const incoming = (activeResponse?.data as CustomerOrder[] | undefined) ?? [];
    const mergeKey = `${activeOrderType}-${page}-${fulfilledTimeStamp ?? 0}`;
    if (lastMergedKeyRef.current === mergeKey) return;
    lastMergedKeyRef.current = mergeKey;

    setOrderItems((prev) => mergeOrders(prev, incoming, page));
    const totalPages = parsePositiveInt(activeResponse?.meta?.totalPages);
    setHasMore(
      totalPages != null ? page < totalPages : incoming.length >= PAGE_LIMIT,
    );
  }, [activeResponse, page, isFetching, fulfilledTimeStamp, activeOrderType]);

  useEffect(() => {
    if (!isFetching) {
      isLoadingNextPageRef.current = false;
    }
  }, [isFetching]);



  function handleScrollNearBottom(e: React.UIEvent<HTMLDivElement>) {
    if (!userId || isFetching || !hasMore || orderItems.length === 0) return;
    if (isLoadingNextPageRef.current) return;

    const el = e.currentTarget;
    const nearBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight <= 80;
    if (!nearBottom) return;

    isLoadingNextPageRef.current = true;
    setPage((p) => p + 1);
  }

  const ph = (key: keyof typeof placeholders) => placeholders[key];
  const isInitialLoading = orderItems.length === 0 && (isLoading || isFetching);
  const isLoadingMore = isFetching && page > 1;
  const showEmpty = !isInitialLoading && count === 0;

  return (
    <div className=" h-full min-h-0 flex-col space-y-2">
      <div className="shrink-0 border-b border-gray-9 flex items-center justify-center">
        <div className="h-[72px] w-full max-w-[522px] flex items-center gap-2 px-4 text-[14px] sm:px-0">
          <span className="text-gray-11">{ph("profile")}</span>
          <Image src={chevronIcon} alt="" className="ltr:rotate-180" />
          <span className="text-green-2">{ph("my_orders")}</span>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 justify-center px-4 sm:px-0">
        <div className="flex w-full max-w-[522px] min-h-0 flex-1 flex-col">
          <Tabs
            paddingX="px-5 md:px-8"
            tabs={orderTypes}
            activeTab={activeOrderType}
            setActiveTab={(value) => setActiveOrderType(value as OrderTypeKey)}
          />


          <div className="mt-4 flex   gap-2 overflow-x-auto hide-scrollbar ">
            {ORDER_STATUS_KEYS.map((statusKey) => {
              const isActive = activeStatus === statusKey;
              return (
                <button
                  key={statusKey}
                  type="button"
                  onClick={() => setActiveStatus(statusKey)}
                  className={`min-w-max cursor-pointer rounded-full border px-3 py-2 text-[14px] font-normal leading-[14px] text-[#030303] ${isActive
                    ? "border-green-1 bg-[#E6FBFB]"
                    : "border-[#D3D3D3] bg-transparent"
                    }`}
                >
                  {tabs?.[statusKey as keyof typeof tabs]}
                </button>
              );
            })}
          </div>

          <div
            ref={listRef}
            onScroll={handleScrollNearBottom}
            className="mt-4 min-h-0 flex-1 overflow-y-auto pb-6"
          >
            {isInitialLoading ? (
              <div className="space-y-7">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex animate-pulse items-center justify-between rounded-lg p-2"
                  >
                    <div className="flex gap-3">
                      <div className="h-[66px] w-[66px] rounded-xl bg-gray-200" />
                      <div className="space-y-2">
                        <div className="h-4 w-40 rounded bg-gray-200" />
                        <div className="h-3 w-24 rounded bg-gray-200" />
                        <div className="h-3 w-20 rounded bg-gray-200" />
                      </div>
                    </div>
                    <div className="h-3.5 w-3.5 rounded bg-gray-200" />
                  </div>
                ))}
              </div>
            ) : count > 0 ? (
              <>
                <div className="space-y-7">
                  {orderItems.map((order: any, index) => {
                    const orderId = order._id ?? order.id ?? index;
                    return (
                      <div
                        key={orderId}
                        onClick={() => {
                          if (activeOrderType === "sold") {
                            router.push(`/selling/product-detail?id=${order?.product?._id}`);
                          } else {
                            router.push(`/buy-product?id=${order?.product?._id}`);
                          }
                        }}
                        className="flex cursor-pointer items-center justify-between rounded-lg p-2 hover:bg-[#E6FBFB]"
                      >
                        <div className="flex min-w-0 flex-1 gap-3">
                          <Image
                            src={
                              (order?.product?.images?.length ?? 0) > 0
                                ? order.product!.images[0]
                                : noImageAvtar
                            }
                            height={100}
                            width={100}
                            unoptimized
                            alt="product"
                            className="h-[66px] w-[66px] shrink-0 rounded-xl object-cover"
                          />
                          <div className="min-w-0">
                            <h3 className="truncate text-[16px] font-medium text-[#030303]">
                              {order?.product?.title ?? ""}
                            </h3>
                            <p className="text-[14px] font-medium text-green-1">
                              {placeholders.Rs} {order?.product?.price ?? ""}
                            </p>
                            <p className="text-[14px] font-normal text-[#E92440]">
                              {
                                placeholders?.[
                                order?.status as keyof typeof placeholders
                                ]
                              }
                            </p>
                          </div>
                        </div>
                        <Image
                          src={chevron}
                          alt=""
                          className="w-3.5 shrink-0 ltr:-rotate-90 rtl:rotate-90"
                        />
                      </div>
                    );
                  })}
                </div>
                {isLoadingMore ? (
                  <div className="flex justify-center py-6">
                    <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-gray-4 border-t-green-1" />
                  </div>
                ) : null}
              </>
            ) : showEmpty ? (
              <div className="flex h-[300px] w-full items-center justify-center text-center text-[14px] text-[#4B514F]">
                {error_messages.no_orders_data}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyOrders;
