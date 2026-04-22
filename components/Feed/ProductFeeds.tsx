"use client";
import React, { useEffect, useState } from "react";
import { useGetAllProductsFeedQuery } from "@/store/services/feedService";
import ReelsFeed from "./ReelsFeed";

type ProductFeedItem = {
    _id?: string;
    id?: string;
    title?: string;
    price?: number;
    video?: string;
    images?: string[];
    category?: {
        name?: string;
    };
};

type FeedReelItem = {
    id: string;
    video: string;
    title: string;
    price: string;
    category: string;
};

type FeedResponseMeta = {
    totalPages?: number | string;
};

type FeedResponse = {
    data?: ProductFeedItem[];
    meta?: FeedResponseMeta;
};

function ProductFeeds() {
    const LIMIT = 10;
    const [page, setPage] = useState(1);
    const [products, setProducts] = useState<FeedReelItem[]>([]);
    const [hasMore, setHasMore] = useState(true);
    const { data: productsFeed, isLoading, isFetching } = useGetAllProductsFeedQuery({ page, limit: LIMIT });
    const isInitialLoading = products.length === 0 && (isLoading || isFetching);

    useEffect(() => {
        const response = (productsFeed as FeedResponse | undefined) ?? undefined;
        const mapped: FeedReelItem[] =
            response?.data
                ?.filter((product: ProductFeedItem) => !!product.video)
                .map((product: ProductFeedItem) => ({
                    id: product._id ?? product.id ?? "",
                    video: product.video ?? "",
                    title: product.title ?? "",
                    price: String(product.price ?? 0),
                    category: product.category?.name ?? "",
                })) ?? [];

        setProducts((prev) => {
            const map = new Map(prev.map((item) => [item.id, item]));
            mapped.forEach((item) => map.set(item.id, item));
            return Array.from(map.values());
        });

        const totalPages = Number(response?.meta?.totalPages ?? 1);
        setHasMore(page < totalPages);
    }, [productsFeed, page]);

    const handleEndReached = () => {
        if (isFetching || !hasMore) return;
        setPage((prev) => prev + 1);
    };
    return (
        <div className="flex h-full min-h-0 w-full justify-center">
            <div className="h-full min-h-0 w-full max-w-full lg:max-w-[456px]">
                {isInitialLoading ? (
                    Array.from({ length: 2 }).map((_, index) => (
                        <div key={index} className="h-[620px] w-full animate-pulse rounded-[8px] bg-gray-200" />
                    ))
                ) : products.length === 0 ? (
                    <div className="rounded-[8px] bg-white p-6 text-center text-sm text-gray-500">
                        No feed available
                    </div>
                ) : (
                    <ReelsFeed
                        type="products"
                        reels={products}
                        onEndReached={handleEndReached}
                        isLoadingMore={isFetching && page > 1}
                    />
                )}
            </div>
        </div>
    );
}

export default ProductFeeds;