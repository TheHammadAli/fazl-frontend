"use client";

import React, { useCallback, useMemo } from "react";
import { Plug, Wind, Wrench, type LucideIcon } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode } from "swiper/modules";
import { useDictionary } from "@/dictionaries/DictionaryProvider";
import { useCategoriesQuery } from "@/custom-hooks/useCategoriesQuery";
import { getFeedCategoryLabel } from "@/utils/getFeedCategoryLabel";
import "swiper/css";

type CategoryItem = {
    _id: string;
    name?: string | { en?: string; ur?: string };
};

type ServiceCategoryStyle = {
    bgClass: string;
    Icon: LucideIcon;
};

const SERVICE_CATEGORY_STYLES: ServiceCategoryStyle[] = [
    { bgClass: "bg-[#EAF1FB]", Icon: Wind },
    { bgClass: "bg-[#FBF3EA]", Icon: Plug },
    { bgClass: "bg-[#DFF4F4]", Icon: Wrench },
];

const SERVICE_SWIPER_BREAKPOINTS = {
    0: {
        slidesPerView: 2.2,
        spaceBetween: 12,
    },
    640: {
        slidesPerView: 3.5,
        spaceBetween: 12,
        slidesOffsetBefore: 0,
        slidesOffsetAfter: 0,
    },
    1024: {
        slidesPerView: 5,
        spaceBetween: 16,
        slidesOffsetBefore: 0,
        slidesOffsetAfter: 0,
        freeMode: false,
    },
    1280: {
        slidesPerView: 8,
        spaceBetween: 16,
        slidesOffsetBefore: 0,
        slidesOffsetAfter: 0,
        freeMode: false,
    },
};

function getServiceCategoryStyle(index: number): ServiceCategoryStyle {
    return SERVICE_CATEGORY_STYLES[index % SERVICE_CATEGORY_STYLES.length];
}

function ServiceCategoryCardSkeleton() {
    return (
        <div className="min-h-[112px] w-full animate-pulse rounded-[16px] bg-gray-200 p-3">
            <div className="h-6 w-6 rounded bg-gray-300" />
            <div className="mt-3 h-4 w-2/3 rounded bg-gray-300" />
        </div>
    );
}

type ServiceCategoryCardProps = {
    name: string;
    style: ServiceCategoryStyle;
    onClick: () => void;
    isActive?: boolean;
};

function ServiceCategoryCard({ name, style, onClick, isActive }: ServiceCategoryCardProps) {
    const { bgClass, Icon } = style;

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={onClick}
            onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onClick();
                }
            }}
            className={`flex min-h-[100px] w-full cursor-pointer flex-col justify-between rounded-[14px] border-1 px-3 py-[14px] transition-opacity hover:opacity-95 ${bgClass} ${isActive ? "border-[#007781]" : "border-transparent"
                }`}
        >
            <Icon className="h-6 w-6 shrink-0 text-[#001907]" strokeWidth={1.75} />
            <p className="truncate-safe mt-3 w-full min-w-0 text-[13px] font-medium text-[#030303] rtl:text-right">
                {name}
            </p>
        </div>
    );
}

export default function ServicesCategories({
    activeCategoryId,
    onCategorySelect,
}: {
    activeCategoryId: string;
    onCategorySelect: (categoryId: string) => void;
}) {
    const { info_messages, currentLanguage } = useDictionary();
    const {
        data: categories,
        isLoading,
        isFetching,
    } = useCategoriesQuery({ type: "service" });

    const isLoadingCategories = isLoading || isFetching;
    const categoryList = useMemo(
        () => (categories?.data ?? []) as CategoryItem[],
        [categories?.data],
    );

    const handleCategorySelect = useCallback(
        (categoryId: string) => {
            onCategorySelect(activeCategoryId === categoryId ? "" : categoryId);
        },
        [activeCategoryId, onCategorySelect],
    );

    const swiperSlides = useMemo(() => {
        if (isLoadingCategories) {
            return Array.from({ length: 6 }).map((_, index) => (
                <SwiperSlide
                    key={`service-category-skeleton-${index}`}
                    className="!h-auto !overflow-visible"
                >
                    <ServiceCategoryCardSkeleton />
                </SwiperSlide>
            ));
        }

        return categoryList.map((category, index) => {
            const style = getServiceCategoryStyle(index);
            const name = getFeedCategoryLabel(category.name, currentLanguage);

            return (
                <SwiperSlide
                    key={category._id}
                    className="!h-auto !overflow-visible"
                >
                    <ServiceCategoryCard
                        name={name}
                        style={style}
                        isActive={activeCategoryId === category._id}
                        onClick={() => handleCategorySelect(category._id)}
                    />
                </SwiperSlide>
            );
        });
    }, [activeCategoryId, categoryList, currentLanguage, handleCategorySelect, isLoadingCategories]);

    if (!isLoadingCategories && categoryList.length === 0) {
        return null;
    }

    return (
        <section className="mt-6 sm:mt-8">
            <h2 className="text-[18px] font-medium text-[#001907]">
                {info_messages.services_categories}
            </h2>

            <div className="mt-4 w-full">
                <Swiper
                    modules={[FreeMode]}
                    className="service-category-swiper w-full"
                    spaceBetween={12}
                    slidesPerView={2.2}
                    freeMode={{ enabled: true, momentum: true }}
                    grabCursor
                    touchStartPreventDefault={false}
                    observer
                    observeParents
                    watchOverflow={false}
                    breakpoints={SERVICE_SWIPER_BREAKPOINTS}
                >
                    {swiperSlides}
                </Swiper>
            </div>
        </section>
    );
}
