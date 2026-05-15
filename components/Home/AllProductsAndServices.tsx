"use client";

import {
    useSearchProductsQuery,
    useSearchServicesQuery,
} from "@/store/services/homeService";
import React, { useCallback, useEffect, useState } from "react";
import AllProductsSkeleton from "./AllProductsSkelton";
import { useRouter } from "next/navigation";
import Image from "next/image";
import noImageAvtar from "@/assets/images/no-image-av.png";
import { AvgRatingStars } from "../Ui/Reviews";
import { useDictionary } from "@/dictionaries/DictionaryProvider";
import { useInView } from "react-intersection-observer";
import { parsePositiveInt } from "../Updates/Notifications";

const PRODUCTS_LIMIT = 12;
const SERVICES_LIMIT = 12;

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

function AllProductsAndServices({ tab }: { tab: string }) {
    const router = useRouter();
    const { placeholders, error_messages } = useDictionary();

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
    } = useSearchProductsQuery(
        { page: productPage, limit: PRODUCTS_LIMIT },
        { skip: tab !== "products" },
    );

    const {
        data: servicesData,
        isLoading: servicesLoading,
        isFetching: servicesFetching,
    } = useSearchServicesQuery(
        { page: servicePage, limit: SERVICES_LIMIT },
        { skip: tab !== "services" },
    );

    const items = tab === "products" ? productItems : serviceItems;
    const hasMore = tab === "products" ? hasMoreProducts : hasMoreServices;
    const isFetching = tab === "products" ? productsFetching : servicesFetching;
    const isLoading = tab === "products" ? productsLoading : servicesLoading;
    const activePage = tab === "products" ? productPage : servicePage;
    const isInitialLoading = items.length === 0 && (isLoading || isFetching);
    const isLoadingMore = isFetching && activePage > 1;

    const loadMore = useCallback(() => {
        if (isFetching || !hasMore || items.length === 0) return;
        if (tab === "products") {
            setProductPage((p) => p + 1);
        } else {
            setServicePage((p) => p + 1);
        }
    }, [tab, isFetching, hasMore, items.length]);

    const { ref: loadMoreRef, inView } = useInView({
        rootMargin: "200px",
        threshold: 0,
    });

    useEffect(() => {
        if (!inView) return;
        loadMore();
    }, [inView, loadMore]);

    useEffect(() => {
        setProductPage(1);
        setProductItems([]);
        setHasMoreProducts(true);
        setServicePage(1);
        setServiceItems([]);
        setHasMoreServices(true);
    }, [tab]);

    useEffect(() => {
        if (tab !== "products" || productsData == null) return;
        const incoming = (productsData?.data?.items as CatalogItem[] | undefined) ?? [];
        setProductItems((prev) => mergeCatalogItems(prev, incoming, productPage));
        const totalPages = parsePositiveInt(productsData?.meta?.totalPages);
        setHasMoreProducts(
            totalPages != null
                ? productPage < totalPages
                : incoming.length >= PRODUCTS_LIMIT,
        );
    }, [productsData, productPage, tab]);

    useEffect(() => {
        if (tab !== "services" || servicesData == null) return;
        const incoming = (servicesData?.data as CatalogItem[] | undefined) ?? [];
        setServiceItems((prev) => mergeCatalogItems(prev, incoming, servicePage));
        const totalPages = parsePositiveInt(servicesData?.meta?.totalPages);
        setHasMoreServices(
            totalPages != null
                ? servicePage < totalPages
                : incoming.length >= SERVICES_LIMIT,
        );
    }, [servicesData, servicePage, tab]);

    const totalCount =
        tab === "products" ? productsData?.meta?.total : servicesData?.meta?.total;

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
                                        if (tab === "products") {
                                            router.push(`/buy-product?id=${itemId}`);
                                        } else {
                                            router.push(`/book-service?id=${itemId}`);
                                        }
                                    }}
                                >
                                    <div className="h-[180px] sm:h-[276px] rounded-[16px] overflow-hidden">
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
                    <div ref={loadMoreRef} className="h-4 w-full" aria-hidden />
                    {isLoadingMore ? (
                        <div className="flex justify-center py-6">
                            <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-gray-4 border-t-green-1" />
                        </div>
                    ) : null}
                </>
            ) : (
                <div className="h-[80vh] flex items-center justify-center w-full text-black-1">
                    {tab === "products"
                        ? error_messages.no_product_data
                        : error_messages.no_service_data}
                </div>
            )}
        </div>
    );
}

export default AllProductsAndServices;
