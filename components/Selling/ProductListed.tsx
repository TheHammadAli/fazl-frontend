"use client";
import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import tickIcon from "@/assets/icons/tick-circle.svg";
import listAnotherImage from "@/assets/icons/list-another-icon.svg";
import { useDictionary } from "@/dictionaries/DictionaryProvider";

interface Props {
  setStatus: (val: string) => void;
  createdData: any
}

function ProductListed({ setStatus, createdData}: Props) {
  const id = useSearchParams().get("id") as string;
  const type = useSearchParams().get("type") as string;
  const router = useRouter();
  const { info_messages, placeholders } = useDictionary();

  return (
    <div className="flex w-full flex-col">
     
     

      <div className="mx-auto flex w-full max-w-[422px] flex-col items-center px-4 pb-10">
        <div className="w-full bg-[#E6FBFB] flex ">
        <Image
          src={listAnotherImage}
          alt=""
          className=""
          priority
        />
        <div>
          <div className="rounded-t-xl h-[226px] w-[209px]">
            <Image
              src={createdData?.images[0]}
              alt=""
              width={209}
              height={226}
              className=""
              priority
            />
          </div>
        </div>
         <Image
          src={listAnotherImage}
          alt=""
          className="rotate-180"
          priority
        />
      </div>
        <div className="flex w-full flex-col items-center mt-8">
          <Image src={tickIcon} alt="tick-icon" className="rounded-full" />
          <h1 className="mt-3 text-center text-[22px] font-medium text-black-1">
            {info_messages.product_listed}
          </h1>
          <h3 className="max-w-[310px] text-center text-[14px] font-normal text-gray-8">
            {info_messages.most_listings}
          </h3>
        </div>

        <div className="w-full">
          <button
            type="button"
            onClick={() => {
              setStatus("form");
              window.location.reload();
            }}
            className="mt-6 h-[50px] w-full cursor-pointer rounded-[12px] border border-green-1 text-[16px] font-medium text-green-1 hover:bg-green-1 hover:text-white"
          >
            {placeholders.list_another}
          </button>

          <div className="mt-6 flex w-full justify-center text-center text-[16px] font-medium text-green-1">
            <button
              type="button"
              className="w-max cursor-pointer hover:underline"
              onClick={() => {
                if (type && type === "personal") {
                  router.push("/selling");
                } else {
                  router.push(`/selling/shop-detail?id=${id}`);
                }
              }}
            >
              {placeholders.later}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductListed;
