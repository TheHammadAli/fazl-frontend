"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import chevron from "@/assets/icons/chev-down-icon.svg";
import { useDictionary } from "@/dictionaries/DictionaryProvider";
import dummyProfile from "@/assets/images/dummy-profile-image.jpg";
import ratingIcons from "@/assets/icons/rating-icons.svg";
import { useGetProductDetailQuery } from "@/store/services/homeService";
import { useSearchParams } from "next/navigation";
import noImageAvtar from "@/assets/images/no-image-av.png";
import { useClickOutside } from "@/custom-hooks/useClickOutside";
import { useGetShopDetailQuery } from "@/store/services/sellingService";
import threeDots from "@/assets/icons/three-dots.svg";
import { useRouter } from "next/navigation";
export type ProductDetailProps = {
  //   setStep?: (val: "product" | "cart") => void;
  product: {
    data: {
      id: string;
      title: string;
      name: string;
      price: number;
      images: string[];
      description: string;
      parameters: { name: string; variants: string[] }[];
      category: { name: string };
    };
    isLoading: boolean;
    isFetching: boolean;
  };
  shopData?: {
    id?: string;
    address?: string;
    title?: string;
    image?: string;
    ownerId?: string;
  };
  //   selectedVariants: Record<string, unknown>;
  //   setSelectedVariants?: React.Dispatch<
  //     React.SetStateAction<Record<string, unknown>>
  //   >;
};
function ProductDetail() {
  const id = useSearchParams().get("id");
  const router = useRouter();

  const {
    data: product,
    isLoading,
    isFetching,
    isSuccess,
  } = useGetProductDetailQuery(id, {
    skip: !id,
  });
  const { data: shopDetail } = useGetShopDetailQuery(product?.data?.shopId, {
    skip: !isSuccess,
  });
  const shopData = shopDetail?.data;
  const { pages, placeholders, info_messages, error_messages } =
    useDictionary();
  const ref = React.useRef<HTMLDivElement>(null);
  const [toggle, setToggle] = useState(-1);
  const [isEdit, setIsEdit] = useState(false);
  const [type, setType] = useState("image");
  const [typeIndex, setTypeIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [videoVersion, setVideoVersion] = useState(0);

  useClickOutside(ref, () => {
    setToggle(-1);
  });
  useClickOutside(ref, () => {
    setIsEdit(false);
  });

  useEffect(() => {
    setMounted(true);
  }, []);
  useEffect(() => {
    if (product?.data?.video) {
      setVideoVersion((v) => v + 1);
    }
  }, [product?.data?.video]);
  return (
    <div>
      <div className="h-full min-h-screen flex flex-col items-center">
        <div className="px-5 sm:px-10 h-[61px] border-b-[1px] border-gray-9 bg-white w-full  flex justify-center">
          <div className="w-full   flex items-center gap-[6px] font-normal text-[14px] mt-5">
            <span className="text-gray-8">{pages.selling}</span>
            <Image
              src={chevron}
              alt="chevron"
              className="-rotate-90 rtl:rotate-90"
            />
            <span className="text-gray-8">{pages.private_listing}</span>
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
                  {type === "image" ? (
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
                    mounted && (
                      <video
                        key={`${product?.data?.video}?v=${product?.data?.updatedAt}`}
                        src={`${product?.data?.video}?v=${product?.data?.updatedAt}`}
                        controls
                        autoPlay={false}
                        className=" h-full w-full object-contain"
                      />
                    )
                  )}
                </div>
                <div className="flex gap-3 flex-wrap">
                  {product?.data?.images?.map(
                    (image: string, index: number) => (
                      <div
                        key={index}
                        onClick={() => {
                          setTypeIndex(index);
                          setType("image");
                        }}
                        className={`rounded-[10px] border-[4px]  overflow-hidden  cursor-pointer ${
                          typeIndex === index && type === "image"
                            ? " border-green-1"
                            : "border-transparent"
                        } h-[96px] w-[96px] object-cover`}
                      >
                        <Image
                          src={image}
                          height={100}
                          width={100}
                          unoptimized
                          alt="product"
                          className="h-[96px] w-[96px] object-cover  "
                        />
                      </div>
                    )
                  )}
                  {mounted && (
                    <video
                      onClick={() => setType("video")}
                      key={`${product?.data?.video}?v=${product?.data?.updatedAt}`}
                      src={`${product?.data?.video}?v=${product?.data?.updatedAt}`}
                      controls={false}
                      className={`h-[96px] w-[96px] border-[4px] object-cover rounded-[10px] cursor-pointer ${
                        type === "video"
                          ? " border-green-1"
                          : "border-transparent"
                      }`}
                    />
                  )}
                </div>
              </div>
              <div className="w-full sm:max-w-[364px] ">
                <div className="space-y-2 sm:space-y-0 flex justify-between ">
                  <div className="flex gap-2">
                    <Image
                      className="h-[44px] w-[44px] rounded-full object-cover bg-gray-12"
                      src={shopData?.image ?? noImageAvtar}
                      alt="profile"
                      height={100}
                      width={100}
                    />
                    <div>
                      <h4 className="text-[#030303] text-[14px]">
                        {shopData?.title ?? ""}
                      </h4>
                      <h4 className="text-[#4B514F] text-[14px] font-light">
                        alex.cloth@gmail.com
                      </h4>
                    </div>
                  </div>
                  <div className=" cursor-pointer relative " ref={ref}>
                    <div className="p-2" onClick={() => setIsEdit(true)}>
                      <Image src={threeDots} alt="threeDots" />
                    </div>

                    {isEdit && (
                      <div className="absolute p-1 shadow-xl right-0 top-6 border-[0.5px] border-[#00000033] rounded-[6px] bg-white w-[136px]">
                        <div
                          onClick={() => {
                            setIsEdit(false);

                            router.push("/selling/update-product?id=" + id);
                          }}
                          className="p-[10px] text-[12px] leading-none hover:bg-green-3"
                        >
                          {placeholders.edit_product}
                        </div>
                        <div
                          onClick={() => setIsEdit(false)}
                          className="p-[8px] text-[12px] leading-none hover:bg-green-3"
                        >
                          {placeholders.delete_product}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <h3 className="text-[#030303] text-[16px] font-medium mt-4">
                  {product?.data?.title ?? ""}
                </h3>
                <h3 className="font-light text-[14px] text-[#4B514F] ">
                  4 Reviews
                </h3>
                <div className="space-x-2 mt-4">
                  <span className="text-green-1 text-[16px] font-medium">
                    {placeholders.Rs} {product?.data?.price ?? ""}
                  </span>
                  <span className="line-through font-light text-[14px]">
                    Rs 2000
                  </span>
                  <span className="font-light text-[14px]">(30% off)</span>
                </div>
                <div className="text-[#4B514F] text-[14px] font-light mt-4">
                  {placeholders.description}
                </div>
                <div className="text-[15px] text-[#030303] font-light">
                  {product?.data?.description ?? ""}
                </div>
                {/* <div className="border-[#E5E5E5]  py-4 px-1.5 border-t-[0.5px] mt-4 flex justify-between">
                  <span className="text-[15px] font-medium">
                    {placeholders.category}
                  </span>
                  <span className="font-light text-[15px] leading-none">
                    {product?.data?.category?.name ?? ""}
                  </span>
                </div> */}
                {/* {product?.data?.parameters?.map(
                  (
                    parameter: { name: string; variants: string[] },
                    index: number
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
                              ] ?? "Choose"
                            )}
                            Choose
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
                              )
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                )} */}
                {/* <button
                  //   disabled={
                  //     Object.keys(selectedVariants).length !==
                  //     product?.data?.parameters?.length
                  //   }
                  className=" mt-8 h-[46px]  disabled:opacity-50 disabled:pointer-events-none border-green-1 border-[1px] w-full rounded-xl flex items-center justify-center font-medium text-[16px] text-green-1 hover:text-white hover:bg-green-1 cursor-pointer"
                >
                  Add to cart
                </button> */}
                <button
                  //   disabled={
                  //     Object.keys(selectedVariants).length !==
                  //     product?.data?.parameters?.length
                  //   }
                  //   onClick={() => setStep && setStep("cart")}
                  className="h-[46px] disabled:opacity-50 disabled:pointer-events-none mt-4 border-green-1 bg-green-1 border-[1px] w-full rounded-xl flex items-center justify-center font-medium text-[16px] text-white hover:text-green-1 hover:bg-white cursor-pointer"
                >
                  {placeholders.promote_product}
                </button>
              </div>
            </div>
            <div className="mt-10 w-full md:max-w-[496px]">
              <div className="flex  gap-[22px] items-center">
                <h1 className="text-[19px] font-medium">Reviews</h1>
                <div className="flex gap-2 ">
                  <Image
                    src={ratingIcons}
                    className="w-[100px]"
                    alt="rating_icons"
                  />
                  <span className="text-[14px] font-medium">4.0 (8)</span>
                </div>
              </div>
              <div className=" grid sm:grid-cols-2 mt-8 gap-6">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className=" flex justify-between gap-2">
                    <div className="h-[34px] w-[34px]">
                      <Image
                        src={dummyProfile}
                        alt="profile"
                        className="h-[34px] min-w-[34px] w-[34px] rounded-full object-cover"
                      />
                    </div>
                    <div className="space-y-1">
                      <h1 className="text-[12px] text-[#030303] font-medium">
                        Nouman Malik
                      </h1>
                      <Image src={ratingIcons} alt="rating_icons" />
                      <p className="text-[13px] font-light text-[#4B514F]">
                        Great price and quality! So happy with my purchase!
                        Thankyou
                      </p>
                    </div>

                    <div className="text-[13px] font-light text-[#4B514F]">
                      3d
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex rounded-[8px] h-[46px] mt-6 text-[14px] font-medium bg-[#F6F6F6] items-center justify-center">
                Read more reviews
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
