"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import chevron from "@/assets/icons/chev-down-icon.svg";
import { useDictionary } from "@/dictionaries/DictionaryProvider";
import noImageAvtar from "@/assets/images/no-image-av.png";
import { useClickOutside } from "@/custom-hooks/useClickOutside";
import useInitiateChat from "@/custom-hooks/useInitiateChat";
import { getUserId } from "@/utils/getUserId";
import Reviews from "../Ui/Reviews";
import { useGetAvgReviewsQuery } from "@/store/services/reviewService";
import { getFeedCategoryLabel } from "@/utils/getFeedCategoryLabel";
import { useAppDispatch } from "@/store/store";
import { addToCart } from "@/store/reducers/cartReducer";
import toast from "react-hot-toast";
import { useRequireSignIn } from "@/custom-hooks/useRequireSignIn";

function BuyProductDetail({
  setStep,
  product,
  shopData,
  ownerData,
  selectedVariants,
  setSelectedVariants,
}: any) {
  const userId = getUserId() ?? "";
  const { requireSignIn } = useRequireSignIn();
  const { onInitiateChat, isLoading } = useInitiateChat();
  const dispatch = useAppDispatch();
  const { pages, placeholders, currentLanguage, info_messages } = useDictionary();
  const ref = React.useRef<HTMLDivElement>(null);
  const [toggle, setToggle] = useState(-1);
  const [type, setType] = useState("image");
  const [typeIndex, setTypeIndex] = useState(0);
  useClickOutside(ref, () => {
    setToggle(-1);
  });
  const { data: avgReview } = useGetAvgReviewsQuery(
    { type: "product", id: product?.data?.id ?? "" },
    { skip: !product?.data?.id },
  );

  const reviewCount = avgReview?.data?.count ?? 0;
  const isOwner = product?.data?.shopId
    ? Boolean(userId) && userId === shopData?.ownerId
    : Boolean(userId) && userId === ownerData?.id;
  const allowedToBuy = !isOwner;
  const allowMessageAndReview = !isOwner;

  const [mounted, setMounted] = useState(false);

  const videoSrc =
    typeof product?.data?.video === "string" && product.data.video.trim() !== ""
      ? product.data.video.trim()
      : null;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (type === "video" && !videoSrc) {
      setType("image");
    }
  }, [type, videoSrc]);

  const handleAddToCart = () => {
    if (!product?.data?.id) return;
    requireSignIn(() => {
      const sellerLabel = product.data.shopId
        ? (shopData?.title ?? "")
        : product.data.ownerId
          ? (ownerData?.name ?? "")
          : "";
      const sellerImage =
        product.data.shopId && shopData?.image
          ? shopData.image
          : product.data.ownerId && ownerData?.image
            ? ownerData.image
            : "";

      dispatch(
        addToCart({
          productId: product.data.id,
          title: product.data.title,
          price: product.data.price,
          image: product.data.images?.[0] ?? "",
          shopId: product.data.shopId,
          ownerId: product.data.ownerId,
          selectedVariants: selectedVariants as Record<string, string>,
          sellerLabel,
          sellerImage,
        }),
      );
      toast.success(info_messages.added_to_cart);
    });
  };

  return (
    <div className="">
      <div className="h-full min-h-screen flex flex-col items-center">
        <div className="px-5 sm:px-10 h-[61px] border-b-[1px] border-gray-9 bg-white w-full  flex justify-center">
          <div className="w-full   flex items-center gap-[6px] font-normal text-[14px] mt-5">
            <span className="text-gray-8">{pages.home}</span>
            <Image
              src={chevron}
              alt="chevron"
              className="-rotate-90 rtl:rotate-90"
            />
            <span className="text-green-1">{product?.data?.title}</span>
          </div>
        </div>

        <div className=" px-5 sm:px-10 py-6 w-full">
          <div className="">
            <div className="flex  flex-col sm:flex-row gap-5 md:gap-12">
              <div className="space-y-3">
                <div className="h-[280px] min-w-[250px] sm:h-[320px] md:h-[500px]  max-w-[496px] xl:w-[496px] object-cover overflow-hidden rounded-[10px]">
                  {type === "image" || !videoSrc ? (
                    <Image
                      src={
                        product?.data?.images?.length > 0
                          ? product?.data?.images?.[typeIndex]
                          : noImageAvtar
                      }
                      height={100}
                      width={100}
                      unoptimized
                      alt="product"
                      className=" h-full w-full object-cover"
                    />
                  ) : (
                    <video
                      src={`${videoSrc}?t=${Date.now()}`}
                      controls
                      autoPlay={false}
                      className=" h-full w-full object-contain"
                    />
                  )}
                </div>
                <div className="flex gap-1 flex-wrap max-w-[496px]">
                  {product?.data?.images?.map(
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
                          alt="product"
                          unoptimized
                          className="h-[96px] w-[96px] object-cover  "
                        />
                      </div>
                    ),
                  )}
                  {videoSrc ? (
                    <video
                      onClick={() => setType("video")}
                      src={videoSrc}
                      controls={false}
                      className={`h-[96px] w-[96px] border-[4px] object-cover rounded-[10px] cursor-pointer ${type === "video"
                        ? " border-green-1"
                        : "border-transparent"
                        }`}
                    />
                  ) : null}
                </div>
              </div>
              <div className="w-full sm:max-w-[364px] ">
                <div className="space-y-2 sm:space-y-2 sm:flex sm:flex-wrap sm:justify-between items-center">

                  <div className="flex items-center gap-2">
                    <Image
                      className="h-[44px] w-[44px] rounded-full object-cover "
                      src={
                        product?.data?.shopId && shopData?.image
                          ? shopData.image
                          : product?.data?.ownerId && ownerData?.image
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
                        {product?.data?.shopId
                          ? shopData?.title
                          : product?.data?.ownerId
                            ? ownerData?.name
                            : ""}
                      </h4>
                      <h4 className="text-[#4B514F] text-[14px] font-light">
                        {product?.data?.shopId
                          ? shopData?.ownerId?.email
                          : product?.data?.ownerId
                            ? ownerData?.email
                            : ""}
                      </h4>
                    </div>
                  </div>

                  {allowMessageAndReview && (
                    <button
                      disabled={isLoading}
                      onClick={() => {
                        requireSignIn(() => {
                          const sellerId = product?.data?.shopId
                            ? shopData?.ownerId
                            : ownerData?.id;
                          onInitiateChat(userId, sellerId ?? "");
                        });
                      }}
                      className=" cursor-pointer border-[1px] border-green-1 text-green-1 flex items-center justify-center rounded-lg h-[33px] w-[111px] text-[13px] font-light"
                    >
                      {isLoading ? (
                        <div className="flex  justify-center py-3" aria-hidden>
                          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-4 border-t-green-1" />
                        </div>
                      ) : (
                        placeholders.message_seller
                      )}
                    </button>
                  )}
                </div>
                <h3 className="text-[#030303] text-[16px] font-medium mt-4">
                  {product?.data?.title ?? ""}
                </h3>
                <h3 className="font-light text-[14px] text-[#4B514F] ">
                  {reviewCount} {reviewCount === 1 ? placeholders.review : placeholders.reviews}
                </h3>
                <div className="space-x-2 mt-4">
                  <span className="text-green-1 text-[16px] font-medium">
                    {placeholders.Rs} {product?.data?.price ?? ""}
                  </span>

                </div>
                <div className="text-[#4B514F] text-[14px] font-light mt-4">
                  {placeholders.description}
                </div>
                <div className="text-[15px] text-[#030303] font-light">
                  {product?.data?.description ?? ""}
                </div>
                <div className="border-[#E5E5E5]  py-4 px-1.5 border-t-[0.5px] mt-4 flex justify-between">
                  <span className="text-[15px] font-medium">
                    {placeholders.category}
                  </span>
                  <span className="font-light text-[15px] leading-none">
                    {getFeedCategoryLabel(product?.data?.category, currentLanguage)}
                  </span>
                </div>
                {mounted &&
                  allowedToBuy &&
                  product?.data?.parameters?.map(
                    (
                      parameter: { name: string; variants: string[] },
                      index: number,
                    ) => (
                      <div
                        key={index}
                        className="border-[#E5E5E5]  py-4 px-1.5 border-t-[0.5px] flex justify-between"
                      >
                        <span className="text-[15px] font-medium leading-none">
                          {parameter?.name}
                        </span>
                        <div className="relative">
                          <div
                            className="flex gap-2 cursor-pointer "
                            onClick={() => setToggle(index)}
                          >
                            <span className="font-light text-[15px] leading-none">
                              {String(
                                selectedVariants[
                                parameter?.name as keyof typeof selectedVariants
                                ] ?? placeholders.choose,
                              )}
                            </span>
                            <Image
                              src={chevron}
                              alt="chevron"
                              className="h-4 w-3"
                            />
                          </div>
                          {toggle === index && (
                            <div
                              ref={ref}
                              className=" z-50 right-0 w-[130px] bg-white shadow-xl rounded-lg border-[1px] border-gray-4 mt-2 absolute"
                            >
                              {parameter?.variants?.map(
                                (variant: string, index: number) => (
                                  <div
                                    key={index}
                                    onClick={() => {
                                      if (setSelectedVariants) {
                                        setSelectedVariants((prev) => ({
                                          ...prev,
                                          [parameter?.name]: variant,
                                        }));
                                      }
                                      setToggle(-1);
                                    }}
                                    className="hover:bg-green-4 cursor-pointer px-2 py-1 border-b-[1px] border-gray-4"
                                  >
                                    {variant}
                                  </div>
                                ),
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ),
                  )}
                {mounted && allowedToBuy && (
                  <button
                    type="button"
                    disabled={
                      Object.keys(selectedVariants).length !==
                      product?.data?.parameters?.length
                    }
                    onClick={handleAddToCart}
                    className=" mt-8 h-[46px]  disabled:opacity-50 disabled:pointer-events-none border-green-1 border-[1px] w-full rounded-xl flex items-center justify-center font-medium text-[16px] text-green-1 hover:text-white hover:bg-green-1 cursor-pointer"
                  >
                    {placeholders.add_cart}
                  </button>
                )}
                {mounted && allowedToBuy && (
                  <button
                    disabled={
                      Object.keys(selectedVariants).length !==
                      product?.data?.parameters?.length
                    }
                    onClick={() => requireSignIn(() => setStep?.("cart"))}
                    className="h-[46px] disabled:opacity-50 disabled:pointer-events-none mt-4 border-green-1 bg-green-1 border-[1px] w-full rounded-xl flex items-center justify-center font-medium text-[16px] text-white hover:text-green-1 hover:bg-white cursor-pointer"
                  >
                    {placeholders.buy_now}
                  </button>
                )}
              </div>
            </div>

            <Reviews type="product" id={product?.data?.id} allowAddReview={allowMessageAndReview} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default BuyProductDetail;
