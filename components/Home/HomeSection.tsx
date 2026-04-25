"use client";
import React, { useRef, useState } from "react";
import searchIcon from "@/assets/icons/searchIcon.svg";
import Image from "next/image";
import Tabs from "../Ui/Tabs";
import { useDictionary } from "@/dictionaries/DictionaryProvider";
import CategoriesList from "./CategoriesList";
import { useClickOutside } from "@/custom-hooks/useClickOutside";
import { useRouter } from "next/navigation";
import {
  useSearchProductsQuery,
  useSearchServicesQuery,
} from "@/store/services/homeService";
import linkIcon from "@/assets/icons/link.png";
import { useDebounce } from "use-debounce";
import BroadCastModal from "../Ui/BroadCastModal";
import Modal from "../Ui/Modals/Modal";
import CategoryModal from "../Services/CategoryModal";

function HomeSection() {
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
  const { placeholders, info_messages } = useDictionary();
  const [openCat, setOpenCat] = useState(false);
  const [categoryId, setCategoryId] = useState<string>("");
  const { data: productsData } = useSearchProductsQuery(
    {
      category: categoryId,
      name: debounceSearch,
    },
    { skip: !categoryId || activeTab !== "products" || !debounceSearch }
  );
  const { data: servicesData } = useSearchServicesQuery(
    {
      category: categoryId,
      name: debounceSearch,
    },
    { skip: !categoryId || activeTab !== "services" || !debounceSearch }
  );

  useClickOutside(catRef, () => {
    setOpenCat(false);
  });

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

      <div ref={catRef} className="">
        <div ref={catRef} className="pt-3">
          <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
          <div className="h-[1px] bg-[#E5E5E5] -mt-[0.5px]"></div>
        </div>

        {openCat && (
          <div className="max-h-[340px] overflow-scroll hide-scrollbar">
            <div className=" overflow-scroll  hide-scrollbar">
              {(activeTab === "products"
                ? productsData?.data?.items
                : servicesData?.data
              )?.map((item: { title: string }, index: number) => (
                <div
                  key={index}
                  onClick={() => {
                    router.push(
                      `/home/search-list?category=${categoryId}&tab=${activeTab}&search=${item?.title}`
                    );
                  }}
                  className="px-[15px] cursor-pointer h-[56px] flex justify-between items-center border-b-[1px] border-b-[#E5E5E5]"
                >
                  <span>{item?.title}</span>
                  <Image src={linkIcon} alt="link" className="rtl:rotate-90" />
                </div>
              ))}
            </div>
            <CategoriesList
              categoryId={categoryId}
              setCategoryId={setCategoryId}
            />
          </div>
        )}
      </div>
      <div className="rounded-[12px] bg-green-1 py-[18px] px-4 flex justify-between items-center mt-6">
        <div>
          <h3 className="text-[18px] font-semibold text-white">
            {info_messages.broadcast_request}
          </h3>
          <p className="text-white font-light text-[14px]">
            {info_messages.tell_sellers}
          </p>
        </div>
        <div onClick={() => setOpenBroadcast(true)} className="bg-white cursor-pointer rounded-[12px] px-4 py-3 text-green-2 font-medium" >
          {info_messages.broadcast_request}
        </div>
      </div>
      <Modal
        editModalRef={broadcastRef}
        open={openBroadcast}
        setOpen={setOpenBroadcast}
        centered={false}
      >
        <div className=" h-full w-full flex justify-center  pt-20 ">
          <BroadCastModal setOpenBroadcast={setOpenBroadcast} />
        </div>
      </Modal>
    </div>
  );
}

export default HomeSection;
