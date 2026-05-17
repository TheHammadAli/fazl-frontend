"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import chevron from "@/assets/icons/chev-down-icon.svg";
import { useDictionary } from "@/dictionaries/DictionaryProvider";
import noImageAvtar from "@/assets/images/no-image-av.png";
import { useGetProductOwnerDetailQuery } from "@/store/services/authService";
import { getUserId } from "@/utils/getUserId";
import useInitiateChat from "@/custom-hooks/useInitiateChat";
import Reviews from "../Ui/Reviews";
import { useGetAvgReviewsQuery } from "@/store/services/reviewService";
import { getFeedCategoryLabel } from "@/utils/getFeedCategoryLabel";
import { useRequireSignIn } from "@/custom-hooks/useRequireSignIn";
export type ServiceDetailProps = {
  setStep?: (val: "service" | "request") => void;
  setOpenPciker?: (val: boolean) => void;
  service: {
    data: {
      video: string;
      id: string;
      title: string;
      ownerId?: string;
      name: string;
      price: number;
      shopId: string;
      paymentType: string;
      images: string[];
      description: string;
      parameters: { name: string; variants: string[] }[];
      category: {
        name: {
          en: string;
          ur: string;
        }
      };
    };
    isLoading: boolean;
    isFetching: boolean;
  };

  selectedVariants?: Record<string, unknown>;
  setSelectedVariants?: React.Dispatch<
    React.SetStateAction<Record<string, unknown>>
  >;
};
function BuyServiceDetail({
  service,
  setOpenPciker,
}: ServiceDetailProps) {
  const userId = getUserId() ?? "";
  const { requireSignIn } = useRequireSignIn();
  const { pages, placeholders, currentLanguage } = useDictionary();
  const [type, setType] = useState("image");
  const [typeIndex, setTypeIndex] = useState(0);
  const isOwner = Boolean(userId) && userId === service?.data?.ownerId;
  const allowedToBuy = !isOwner;
  const allowMessageAndReview = !isOwner;
  const [mounted, setMounted] = useState(false);
  const { data: ownerDetail } = useGetProductOwnerDetailQuery(
    service?.data?.ownerId,
    {
      skip: !service?.data?.ownerId,
    }
  );
  const { data: avgReview } = useGetAvgReviewsQuery(
    { type: "service", id: service?.data?.id ?? "" },
    { skip: !service?.data?.id }
  );
  const reviewCount = avgReview?.data?.count ?? 0;
  const { onInitiateChat, isLoading } = useInitiateChat();
  const ownerData = ownerDetail?.data;

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div>
      <div className="h-full min-h-screen flex flex-col items-center">
        <div className="px-5 sm:px-10 h-[61px] border-b-[1px] border-gray-9 bg-white w-full  flex justify-center">
          <div className="w-full   flex items-center gap-[6px] font-normal text-[14px] mt-5">
            <span className="text-gray-8">{pages.home}</span>
            <Image
              src={chevron}
              alt="chevron"
              className="-rotate-90 rtl:rotate-90"
            />
            <span className="text-green-1">{service?.data?.title}</span>
          </div>
        </div>

        <div className=" px-5 sm:px-10 py-6 w-full">
          <div className="">
            <div className="flex  flex-col sm:flex-row gap-5 lg:gap-12">
              <div className="space-y-3">
                <div className="h-[280px] min-w-[250px] sm:h-[320px] md:h-[500px]  max-w-[496px] xl:w-[496px] object-cover overflow-hidden rounded-[10px]">
                  {type === "image" ? (
                    <Image
                      src={
                        service?.data?.images?.length > 0
                          ? service?.data?.images?.[typeIndex]
                          : noImageAvtar
                      }
                      height={100}
                      width={100}
                      unoptimized
                      alt="service"
                      className=" h-full w-full object-cover"
                    />
                  ) : (
                    <video
                      src={`${service?.data?.video}?t=${Date.now()}` as string}
                      controls
                      autoPlay={false}
                      className=" h-full w-full object-contain"
                    />
                  )}
                </div>
                <div className="flex gap-1 flex-wrap max-w-[496px]">
                  {service?.data?.images?.map(
                    (image: string, index: number) => (
                      <div
                        key={index}
                        onClick={() => {
                          setTypeIndex(index);
                          setType("image");
                        }}
                        className={`rounded-[10px] border-[4px]  overflow-hidden  cursor-pointer ${typeIndex === index && type === "image"
                          ? " border-green-1"
                          : "border-transparent"
                          } h-[96px] w-[96px] object-cover`}
                      >
                        <Image
                          src={image}
                          height={100}
                          width={100}
                          alt="service"
                          unoptimized
                          className="h-[96px] w-[96px] object-cover  "
                        />
                      </div>
                    )
                  )}
                  {service?.data?.video && (
                    <video
                      onClick={() => setType("video")}
                      src={service?.data?.video as string}
                      controls={false}
                      className={`h-[96px] w-[96px] border-[4px] object-cover rounded-[10px] cursor-pointer ${type === "video"
                        ? " border-green-1"
                        : "border-transparent"
                        }`}
                    />
                  )}
                </div>
              </div>
              <div className="w-full sm:max-w-[430px] ">
                <div className="space-y-2 sm:space-y-2 flex  flex-wrap md:space-y-2 justify-between gap-1 ">
                  <div className="flex gap-2">
                    <Image
                      className="h-[44px] w-[44px] rounded-full object-cover "
                      src={
                        service?.data?.ownerId && ownerData?.image
                          ? ownerData.image
                          : noImageAvtar
                      }
                      alt="profile"
                      height={100}
                      width={100}
                      unoptimized
                    />
                    <div>
                      <h4 className="text-[#030303] text-[14px]">
                        {service?.data?.ownerId ? ownerData?.name : ""}
                      </h4>
                      <h4 className="text-[#4B514F] text-[14px] font-light">
                        {service?.data?.ownerId ? ownerData?.email : ""}
                      </h4>
                    </div>
                  </div>
                  {allowMessageAndReview && <button disabled={isLoading} onClick={() => requireSignIn(() => onInitiateChat(userId, service?.data?.ownerId ?? ""))} className=" cursor-pointer border-[1px] w-[163px] whitespace-nowrap border-green-1 text-green-1 flex items-center justify-center rounded-lg h-[33px] px-2 text-[13px] font-light">
                    {isLoading ? <div className="flex  justify-center py-3" aria-hidden>
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-4 border-t-green-1" />
                    </div> : placeholders.message_provider}
                  </button>}
                </div>
                <h3 className="text-[#030303] text-[16px] font-medium mt-4">
                  {service?.data?.title ?? ""}
                </h3>
                <h3 className="font-light text-[14px] text-[#4B514F] ">
                  {reviewCount} {reviewCount === 1 ? placeholders.review : placeholders.reviews}
                </h3>
                <div className="space-x-2 mt-4">
                  <span className="text-green-1 text-[16px] font-medium">
                    {placeholders.Rs} {service?.data?.price ?? ""}/
                    {placeholders?.[
                      service?.data?.paymentType as keyof typeof placeholders
                    ]?.toLocaleLowerCase() ?? ""}
                  </span>
                </div>
                <div className="text-[#4B514F] text-[14px] font-light mt-4">
                  {placeholders.description}
                </div>
                <div className="text-[15px] text-[#030303] font-light">
                  {service?.data?.description ?? ""}
                </div>
                <div className="border-[#E5E5E5]  py-4 px-1.5 border-t-[0.5px] mt-4 flex justify-between">
                  <span className="text-[15px] font-medium">
                    {placeholders.category}
                  </span>
                  <span className="font-light text-[15px] leading-none">
                    {getFeedCategoryLabel(service?.data?.category, currentLanguage)}
                  </span>
                </div>

                {mounted && allowedToBuy && (
                  <button
                    onClick={() => {
                      requireSignIn(() => setOpenPciker?.(true));
                    }}
                    className="h-[46px] disabled:opacity-50 disabled:pointer-events-none mt-4 border-green-1 bg-green-1 border-[1px] w-full rounded-xl flex items-center justify-center font-medium text-[16px] text-white hover:text-green-1 hover:bg-white cursor-pointer"
                  >
                    {placeholders.book_now}
                  </button>
                )}
              </div>
            </div>
            <Reviews type="service" id={service?.data?.id} allowAddReview={allowMessageAndReview} />

          </div>
        </div>
      </div>
    </div>
  );
}

export default BuyServiceDetail;
