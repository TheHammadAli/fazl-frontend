"use client";

import {
    useSearchProductsQuery,
    useSearchServicesQuery,
} from "@/store/services/homeService";
import React, { useCallback, useEffect, useRef, useState } from "react";
import AllProductsSkeleton from "./AllProductsSkelton";
import { useRouter } from "next/navigation";
import Image from "next/image";
import noImageAvtar from "@/assets/images/no-image-av.png";
import { AvgRatingStars } from "../Ui/Reviews";
import { useDictionary } from "@/dictionaries/DictionaryProvider";
import { parsePositiveInt } from "../Updates/Notifications";
import { getCatalogItemsFromSearchResponse } from "@/utils/catalogSearch";

const PRODUCTS_LIMIT = 12;
const SERVICES_LIMIT = 12;
const SCROLL_LOAD_MARGIN_PX = 200;

type TabKey = "products" | "services";

type CatalogItem = {
    id: string;
    _id: string;
    title: string;
    price: string | number;
    images: string[];
    reviewCount: number;
    averageRating: number;
};

function mergeCatalogItems(
    prev: CatalogItem[],
    incoming: CatalogItem[],
    page: number,
): CatalogItem[] {
    if (page === 1) return incoming;
    const seen = new Set(prev.map((item) => item.id || item._id));
    const next = [...prev];
    for (const item of incoming) {
        const key = item.id || item._id;
        if (!seen.has(key)) {
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

function AllProductsAndServices({ tab }: { tab: string }) {
    const router = useRouter();
    const { placeholders, error_messages } = useDictionary();
    const activeTab = tab as TabKey;
    const sentinelRef = useRef<HTMLDivElement>(null);
    const [sentinelReady, setSentinelReady] = useState(false);
    const lastMergedProductsKeyRef = useRef("");
    const lastMergedServicesKeyRef = useRef("");
    const maxRequestedPageRef = useRef({ products: 1, services: 1 });

    const [productPage, setProductPage] = useState(1);
    const [servicePage, setServicePage] = useState(1);
    const [productItems, setProductItems] = useState<CatalogItem[]>([]);
    const [serviceItems, setServiceItems] = useState<CatalogItem[]>([]);
    const [hasMoreProducts, setHasMoreProducts] = useState(true);
    const [hasMoreServices, setHasMoreServices] = useState(true);

    const {
        data: productsData,
        isLoading: productsLoading,
        isFetching: productsFetching,
        fulfilledTimeStamp: productsFulfilledTimeStamp,
    } = useSearchProductsQuery(
        { page: productPage, limit: PRODUCTS_LIMIT },
        { skip: activeTab !== "products" },
    );

    const {
        data: servicesData,
        isLoading: servicesLoading,
        isFetching: servicesFetching,
        fulfilledTimeStamp: servicesFulfilledTimeStamp,
    } = useSearchServicesQuery(
        { page: servicePage, limit: SERVICES_LIMIT },
        { skip: activeTab !== "services" },
    );

    const items = activeTab === "products" ? productItems : serviceItems;
    const hasMore = activeTab === "products" ? hasMoreProducts : hasMoreServices;
    const isFetching =
        activeTab === "products" ? productsFetching : servicesFetching;
    const isLoading =
        activeTab === "products" ? productsLoading : servicesLoading;
    const activePage = activeTab === "products" ? productPage : servicePage;
    const isInitialLoading = items.length === 0 && (isLoading || isFetching);
    const isLoadingMore = isFetching && activePage > 1;

    const requestNextPage = useCallback(
        (targetTab: TabKey) => {
            if (activeTab !== targetTab || isFetching) return;

            const currentPage =
                targetTab === "products" ? productPage : servicePage;
            const tabHasMore =
                targetTab === "products" ? hasMoreProducts : hasMoreServices;
            const tabItems =
                targetTab === "products" ? productItems : serviceItems;

            if (!tabHasMore || tabItems.length === 0) return;

            const nextPage = currentPage + 1;
            if (maxRequestedPageRef.current[targetTab] >= nextPage) return;

            maxRequestedPageRef.current[targetTab] = nextPage;
            if (targetTab === "products") {
                setProductPage(nextPage);
            } else {
                setServicePage(nextPage);
            }
        },
        [
            activeTab,
            isFetching,
            productPage,
            servicePage,
            hasMoreProducts,
            hasMoreServices,
            productItems,
            serviceItems,
        ],
    );

    const requestNextPageRef = useRef(requestNextPage);
    requestNextPageRef.current = requestNextPage;

    const tryLoadFromScroll = useCallback(() => {
        if (!isSentinelVisible(sentinelRef.current)) return;
        requestNextPageRef.current(activeTab);
    }, [activeTab]);

    useEffect(() => {
        setProductPage(1);
        setProductItems([]);
        setHasMoreProducts(true);
        setServicePage(1);
        setServiceItems([]);
        setHasMoreServices(true);
        lastMergedProductsKeyRef.current = "";
        lastMergedServicesKeyRef.current = "";
        maxRequestedPageRef.current = { products: 1, services: 1 };
    }, [tab]);

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
    }, [tryLoadFromScroll, hasMore, sentinelReady, activeTab]);

    useEffect(() => {
        if (activeTab !== "products" || productsData == null || productsFetching) {
            return;
        }

        const incoming = getCatalogItemsFromSearchResponse(
            productsData,
        ) as CatalogItem[];
        const mergeKey = `${productPage}-${productsFulfilledTimeStamp ?? 0}`;
        if (lastMergedProductsKeyRef.current === mergeKey) return;
        lastMergedProductsKeyRef.current = mergeKey;

        setProductItems((prev) => {
            const next = mergeCatalogItems(prev, incoming, productPage);
            const totalPages = parsePositiveInt(productsData?.meta?.totalPages);
            const total = parsePositiveInt(productsData?.meta?.total);
            setHasMoreProducts(
                totalPages != null
                    ? productPage < totalPages
                    : total != null
                        ? next.length < total
                        : incoming.length >= PRODUCTS_LIMIT,
            );
            return next;
        });
    }, [
        productsData,
        productPage,
        activeTab,
        productsFetching,
        productsFulfilledTimeStamp,
    ]);

    useEffect(() => {
        if (activeTab !== "services" || servicesData == null || servicesFetching) {
            return;
        }

        const incoming = getCatalogItemsFromSearchResponse(
            servicesData,
        ) as CatalogItem[];
        const mergeKey = `${servicePage}-${servicesFulfilledTimeStamp ?? 0}`;
        if (lastMergedServicesKeyRef.current === mergeKey) return;
        lastMergedServicesKeyRef.current = mergeKey;

        setServiceItems((prev) => {
            const next = mergeCatalogItems(prev, incoming, servicePage);
            const totalPages = parsePositiveInt(servicesData?.meta?.totalPages);
            const total = parsePositiveInt(servicesData?.meta?.total);
            setHasMoreServices(
                totalPages != null
                    ? servicePage < totalPages
                    : total != null
                        ? next.length < total
                        : incoming.length >= SERVICES_LIMIT,
            );
            return next;
        });
    }, [
        servicesData,
        servicePage,
        activeTab,
        servicesFetching,
        servicesFulfilledTimeStamp,
    ]);

    const totalCount =
        activeTab === "products"
            ? productsData?.meta?.total
            : servicesData?.meta?.total;

    return (
        <div>
            {isInitialLoading ? (
                <AllProductsSkeleton />
            ) : totalCount > 0 || items.length > 0 ? (
                <>
                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-x-5 md:gap-y-14 mt-4">
                        {items.map((item) => {
                            const itemId = item?.id || item?._id;
                            return (
                                <div
                                    key={itemId}
                                    className="cursor-pointer"
                                    onClick={() => {
                                        if (!itemId) return;
                                        if (activeTab === "services") {
                                            router.push(
                                                `/book-service?id=${itemId}`,
                                            );
                                        } else {
                                            router.push(
                                                `/buy-product?id=${itemId}`,
                                            );
                                        }
                                    }}
                                >
                                    <div className="h-[180px] sm:h-[276px] rounded-[16px] overflow-hidden shadow-menu">
                                        <Image
                                            src={
                                                item?.images?.length > 0
                                                    ? item?.images?.[0]
                                                    : noImageAvtar
                                            }
                                            alt="product_img"
                                            height={100}
                                            width={100}
                                            className="h-full w-full object-cover bg-gray-12"
                                            unoptimized
                                        />
                                    </div>
                                    <h2 className="text-black-1 font-medium text-[16px] mt-3 line-clamp-1 first-letter:capitalize">
                                        {item?.title}
                                    </h2>
                                    <div className="flex gap-2">
                                        <AvgRatingStars
                                            rating={item?.averageRating}
                                            isLoading={false}
                                            size={22}
                                        />
                                        <span className="text-gray-8 text-[14px] font-normal">
                                            ({item?.reviewCount ?? 0})
                                        </span>
                                    </div>
                                    <h2 className="text-green-1 font-normal text-[16px]">
                                        {placeholders.Rs} {item?.price}
                                    </h2>
                                </div>
                            );
                        })}
                    </div>
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
            ) : (
                <div className="h-[80vh] flex items-center justify-center w-full text-black-1">
                    {activeTab === "products"
                        ? error_messages.no_product_data
                        : error_messages.no_service_data}
                </div>
            )}
        </div>
    );
}

export default AllProductsAndServices;
