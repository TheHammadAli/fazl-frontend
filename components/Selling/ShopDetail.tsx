"use client";

import Image from "next/image";
import { useState } from "react";
import { Star } from "lucide-react";
import { useDictionary } from "@/dictionaries/DictionaryProvider";
import chevron from "@/assets/icons/chev-down-icon.svg";
import profileImg from "@/assets/images/dummy-profile-image.jpg";
import tickGray from "@/assets/icons/completed-tick-gray.svg";
import locationIcon from "@/assets/icons/location-gray.svg";
import ShopProducts from "./ShopProducts";

const products = [
  {
    id: 1,
    name: "Men’s Blue Jeans High...",
    price: 1500,
    discount: true,
    image: "/jeans.jpg",
    rating: 4,
  },
  {
    id: 2,
    name: "MacBook 13’’ 16 - 256",
    price: 150000,
    discount: false,
    image: "/macbook.jpg",
    rating: 4,
  },
  {
    id: 3,
    name: "Black Leather Jacket",
    price: 1500,
    discount: true,
    image: "/jacket.jpg",
    rating: 4,
  },
  {
    id: 4,
    name: "Orang Cap",
    price: 2500,
    discount: true,
    image: "/cap.jpg",
    rating: 4,
  },
  {
    id: 5,
    name: "Red Long Coat",
    price: 3500,
    discount: false,
    image: "/coat.jpg",
    rating: 4,
  },
];

export default function ShopDetail() {
  const [tab, setTab] = useState("shop");
  const { pages, placeholders } = useDictionary();

  return (
    <div>
      <div className="px-5 md:px-6 h-[61px] border-b-[1px] border-gray-9 bg-white w-full  flex justify-center">
        <div className="w-full   flex items-center gap-[6px] font-normal text-[14px] mt-5">
          <span className="text-gray-8">{pages.selling}</span>
          <Image
            src={chevron}
            alt="chevron"
            className="-rotate-90 rtl:rotate-90"
          />
          <span className="text-gray-8">{placeholders.my_shops}</span>
          <Image
            src={chevron}
            alt="chevron"
            className="-rotate-90 rtl:rotate-90"
          />
          <span className="text-green-1">test_shop</span>
        </div>
      </div>
      <div className="lg:flex min-h-screen">
        {/* Sidebar */}
        <div className="lg:w-[35%] border-r-[1px] border-gray-9 p-4 xl:p-6 space-y-[16px] md:space-y-[20px]">
          <h2 className="text-black-1 font-semibold text-[16px] leading-none">
            {placeholders.about}
          </h2>
          <div className="flex items-center gap-[14px]">
            <Image
              src={profileImg}
              alt="profile"
              className="rounded-full h-[66px] w-[66px] min-w-[66px] object-cover"
            />
            <div>
              <h2 className="  text-black-3 text-[18px] font-medium">
                alexcloth
              </h2>
              <p className="text-[16px] font-normal text-gray-13">
                alex.cloth@gmail.com
              </p>
            </div>
          </div>
          <div className="flex justify-between text-[14px] font-normal">
            <h3 className="text-gray-8">{placeholders.about_us}</h3>
            <h3 className="text-green-1 cursor-pointer underline">
              {placeholders.edit}
            </h3>
          </div>

          <div className=" font-light text-[15px] text-black-1 -mt-3">
            <p>
              If you ever have an issue don’t hesitate to reach out! we will
              gladly help fix it as fast as we can.
            </p>
            <div className="mt-3 space-y-1">
              <div className="flex gap-1.5  items-center">
                <Image src={tickGray} alt="tick" />
                <span className="text-gray-8 font-light text-[14px]">
                  alexcloth123@gmail.com
                </span>
              </div>
              <div className="flex gap-1.5 items-center">
                <Image src={locationIcon} alt="location" />
                <span className="text-gray-8 font-light text-[14px]">
                  Shop 123, Krachi Company, G-9 Islamabad
                </span>
              </div>
            </div>
          </div>

          <div className="flex lg:justify-between gap-2 mt-4">
            <div className="bg-gray-12 h-[73px] px-4 xl:px-6 w-[168px]  rounded-[14px] flex flex-col justify-center">
              <p className="text-[14px] text-gray-8  font-normal">
                {placeholders.total_orders}
              </p>
              <p className="font-medium text-[20px] text-black-1">21</p>
            </div>

            <div className="bg-gray-12 h-[73px]  px-4 xl:px-6 w-[168px]  rounded-[14px] flex flex-col justify-center">
              <p className="text-[14px] text-gray-8  font-normal">
                {placeholders.products_sold}
              </p>
              <p className="font-medium text-[20px] text-black-1">21</p>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <button className="w-full max-w-[400px] bg-green-1 text-[16px] h-[46px] font-medium text-white flex items-center justify-center rounded-xl cursor-pointer">
              {placeholders.list_product}
            </button>
            <button className="w-full max-w-[400px] bg-white border-[1px] border-green-1 text-green-1 text-[16px] h-[46px] font-medium flex items-center justify-center rounded-xl cursor-pointer">
              {placeholders.promote_shop}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:w-[65%] xl:pr-5">
          <ShopProducts />
        </div>
      </div>
    </div>
  );
}
