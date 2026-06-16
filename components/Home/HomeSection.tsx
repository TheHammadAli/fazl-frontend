"use client";
import React, { useRef, useState } from "react";
import searchIcon from "@/assets/icons/searchIcon.svg";
import Image from "next/image";
import Tabs from "../Ui/Tabs";
import { useDictionary } from "@/dictionaries/DictionaryProvider";
import { useClickOutside } from "@/custom-hooks/useClickOutside";
import { useRouter } from "next/navigation";
import {
  useSearchProductsQuery,
  useSearchServicesQuery,
} from "@/store/services/homeService";
import linkIcon from "@/assets/icons/link.png";
import broadcastServiceIcon from "@/assets/icons/broadcast_service.svg";
import postAnAdIcon from "@/assets/icons/post_an_ad.svg";
import createShopIcon from "@/assets/icons/create_shop.svg";
import { useDebounce } from "use-debounce";
import BroadCastModal from "../Ui/BroadCastModal";
import Modal from "../Ui/Modals/Modal";
import AllProductsAndServices from "./AllProductsAndServices";
import { useIsGuest } from "@/custom-hooks/useIsGuest";
import { getCatalogItemsFromSearchResponse } from "@/utils/catalogSearch";
import type { StaticImageData } from "next/image";
import FindProdBanner from "./FindProdBanner";
import ProductCategories from "./ProductCategories";
import ServicesCategories from "./ServicesCategories";
import RecentBroadCasts from "./RecentBroadCasts";

type HomeActionCardProps = {
  bgClass: string;
  icon: StaticImageData;
  title: string;
  description: string;
  buttonLabel: string;
  buttonClass: string;
  onClick: () => void;
};

function renderDescription(text: string) {
  return text.split("\n").map((line, index) => (
    <span key={index} className="block">
      {line}
    </span>
  ));
}

function HomeActionCard({
  bgClass,
  icon,
  title,
  description,
  buttonLabel,
  buttonClass,
  onClick,
}: HomeActionCardProps) {
  return (
    <div
      className={`flex w-full flex-col rounded-[16px] p-2.5 sm:p-3 lg:p-4 ${bgClass}`}
    >
      <div className="flex items-start gap-2 sm:gap-2.5 lg:gap-3">
        <div className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-full bg-white sm:h-[52px] sm:w-[52px] lg:h-[62px] lg:w-[62px]">
          <Image src={icon} alt="" className="max-h-[70%] max-w-[70%] lg:max-h-none lg:max-w-none" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-[15px] font-semibold leading-snug text-[#001907]">
            {title}
          </h3>
          <p className="mt-1 text-[14px] font-normal leading-snug text-[#001907]">
            {renderDescription(description)}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onClick}
        className={`mt-3 flex h-[36px] w-full cursor-pointer items-center justify-center rounded-[8px] px-3 text-center text-[13px] font-medium text-white sm:mt-3.5 lg:mt-4 lg:h-[40px] lg:px-4 ${buttonClass}`}
      >
        {buttonLabel}
      </button>
    </div>
  );
}

function HomeSection() {
  const isGuest = useIsGuest();
  const [openBroadcast, setOpenBroadcast] = useState(false);
  const broadcastRef = useRef<HTMLDivElement>(null);
  const tabsComponents: { [key: string]: React.ReactNode } = {
    products: <></>,
    services: <></>,
  };

  const [search, setSearch] = useState<string>("");
  const [debounceSearch] = useDebounce(search, 500);

  const router = useRouter();
  const catRef = useRef<HTMLDivElement>(null);
  const tabs = ["products", "services"];
  const [activeTab, setActiveTab] = useState<string>(tabs[0]);
  const { placeholders, info_messages, error_messages } = useDictionary();
  const [openCat, setOpenCat] = useState(false);
  const [productCategoryId, setProductCategoryId] = useState("");
  const [serviceCategoryId, setServiceCategoryId] = useState("");
  const { data: productsData, isLoading: isProductsLoading, isFetching: isProductsFetching } = useSearchProductsQuery(
    {
      // category: categoryId,
      name: debounceSearch,
    },
    {
      skip:
        //  !categoryId ||
        activeTab !== "products" ||
        !debounceSearch
    }
  );
  const { data: servicesData, isLoading: isServicesLoading, isFetching: isServicesFetching } = useSearchServicesQuery(
    {
      // category: categoryId,
      name: debounceSearch,
    },
    {
      skip:
        // !categoryId ||
        activeTab !== "services" || !debounceSearch
    }
  );

  useClickOutside(catRef, () => {
    setOpenCat(false);
  });
  const isSearchLoading =
    !!debounceSearch &&
    (activeTab === "products"
      ? isProductsLoading || isProductsFetching
      : isServicesLoading || isServicesFetching);

  return (
    <div className="p-5">
      {/* Search */}
      <div className="relative" onClick={() => setOpenCat(true)}>
        <Image
          className="absolute left-3 top-1/2 -translate-y-1/2"
          src={searchIcon}
          alt="search_icon"
        />

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`${placeholders.search_for} ${placeholders?.[activeTab as keyof typeof placeholders]
            }`}
          className=" h-[46px] pl-8 text-[14px] placeholder:text-[14px] text-[#727272] placeholder:text-[#727272] font-normal w-full bg-[#EEF2F3] focus:outline-0 rounded-[8px]"
        />
      </div>
      <div ref={catRef}>
        {openCat && (
          <>
            <div className="pt-3">
              <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
              <div className="h-[1px] bg-[#E5E5E5] -mt-[0.5px]"></div>
            </div>

            <div className="max-h-[340px] overflow-scroll hide-scrollbar">
              {isSearchLoading ? (
                <div className="overflow-scroll hide-scrollbar">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div
                      key={`search-skeleton-${index}`}
                      className="px-[15px] h-[56px] flex justify-between items-center border-b-[1px] border-b-[#E5E5E5] animate-pulse"
                    >
                      <div className="h-4 w-3/5 rounded bg-gray-200" />
                      <div className="h-4 w-4 rounded bg-gray-200" />
                    </div>
                  ))}
                </div>
              ) : getCatalogItemsFromSearchResponse(
                activeTab === "products" ? productsData : servicesData,
              ).length > 0 ? (
                <div className=" overflow-scroll  hide-scrollbar">
                  {getCatalogItemsFromSearchResponse(
                    activeTab === "products" ? productsData : servicesData,
                  ).map((item: { title: string }, index: number) => (
                    <div
                      key={index}
                      onClick={() => {
                        const activeCategoryId =
                          activeTab === "products"
                            ? productCategoryId
                            : serviceCategoryId;
                        const params = new URLSearchParams({
                          tab: activeTab,
                          search: item?.title,
                        });
                        if (activeCategoryId) {
                          params.set("categoryId", activeCategoryId);
                        }
                        router.push(`/home/search-list?${params.toString()}`);
                      }}
                      className="px-[15px] cursor-pointer h-[56px] flex justify-between items-center border-b-[1px] border-b-[#E5E5E5]"
                    >
                      <span>{item?.title}</span>
                      <Image src={linkIcon} alt="link" className="rtl:rotate-90" />
                    </div>
                  ))}
                </div>
              ) : debounceSearch ? (
                <div className="h-[410px] w-full flex items-center justify-center">
                  <h1 className="text-black-3 text-[16px] font-medium">
                    {activeTab === "products" ? error_messages.no_product_data : error_messages.no_service_data}
                  </h1>
                </div>
              ) : null}
              {/* <CategoriesList
              categoryId={categoryId}
              setCategoryId={setCategoryId}
            /> */}
            </div>
          </>
        )}
      </div>
      <FindProdBanner />



      {!isGuest && (
        <>
          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-3 md:grid-cols-3 lg:gap-6">
            <HomeActionCard
              bgClass="bg-[#DFF4F4]"
              icon={broadcastServiceIcon}
              title={info_messages.broadcast_request}
              description={info_messages.send_request_nearby}
              buttonLabel={info_messages.broadcast_now}
              buttonClass="bg-[#007781]"
              onClick={() => setOpenBroadcast(true)}
            />
            <HomeActionCard
              bgClass="bg-[#EAF1FB]"
              icon={postAnAdIcon}
              title={info_messages.post_an_ad}
              description={info_messages.sell_products_fast}
              buttonLabel={info_messages.create_an_ad}
              buttonClass="bg-[#3A46FF]"
              onClick={() => router.push("/selling/list-product?type=personal")}
            />
            <HomeActionCard
              bgClass="bg-[#FBF3EA]"
              icon={createShopIcon}
              title={placeholders.create_shop}
              description={info_messages.start_online_store}
              buttonLabel={placeholders.create_shop}
              buttonClass="bg-[#E1990D]"
              onClick={() => router.push("/selling/create-shop")}
            />
          </div>

          <Modal
            editModalRef={broadcastRef}
            open={openBroadcast}
            setOpen={setOpenBroadcast}
            centered={false}
          >
            <div className="flex h-full w-full justify-center pt-12">
              <BroadCastModal setOpenBroadcast={setOpenBroadcast} />
            </div>
          </Modal>
        </>
      )}
      {!isGuest && <RecentBroadCasts />}
      <ProductCategories
        activeCategoryId={productCategoryId}
        onCategorySelect={setProductCategoryId}
      />
      <AllProductsAndServices tab="products" categoryId={productCategoryId} />
      <ServicesCategories
        activeCategoryId={serviceCategoryId}
        onCategorySelect={setServiceCategoryId}
      />
      <AllProductsAndServices tab="services" categoryId={serviceCategoryId} />

    </div>
  );
}

export default HomeSection;
