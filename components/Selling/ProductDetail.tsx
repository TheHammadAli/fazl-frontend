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
import {
  useDeleteProductMutation,
  useGetShopDetailQuery,
} from "@/store/services/sellingService";
import threeDots from "@/assets/icons/three-dots.svg";
import { useRouter } from "next/navigation";
import { useGetProductOwnerDetailQuery } from "@/store/services/authService";
import Reviews from "../Ui/Reviews";
import { getUserId } from "@/utils/getUserId";
import { useGetAvgReviewsQuery } from "@/store/services/reviewService";
import Modal from "../Ui/Modals/Modal";
import { toast } from "react-hot-toast";
import { BeatLoader } from "react-spinners";
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
  const userId = getUserId() ?? "";
  const {
    data: product,
    isLoading,
    isFetching,
    isSuccess,
  } = useGetProductDetailQuery(id, {
    skip: !id,
  });


  const { data: avgReview, isLoading: isLoadingAvgReview } = useGetAvgReviewsQuery(
    { type: "product", id: product?.data?.id ?? "" },
    { skip: !product?.data?.id || !product?.data?.id }
  );
  const reviewCount = avgReview?.data?.count ?? 0;
  const shopData = product?.data?.shopId;
  const ownerData = product?.data?.ownerId;
  const { pages, placeholders, info_messages, error_messages } =
    useDictionary();
  const ref = React.useRef<HTMLDivElement>(null);
  const [isEdit, setIsEdit] = useState(false);
  const [type, setType] = useState("image");
  const [typeIndex, setTypeIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [videoVersion, setVideoVersion] = useState(0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteProduct, { isLoading: isDeleteLoading }] = useDeleteProductMutation();
  const deleteModalRef = React.useRef<HTMLDivElement>(null);
  const allowedToBuy = product?.data?.shopId
    ? userId !== shopData?.ownerId
    : userId !== ownerData?.id;

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

  const handleDeleteProduct = () => {
    if (!id) return;
    deleteProduct(id)
      .unwrap()
      .then((res) => {
        toast.success(res?.message || placeholders.delete_product);
        setIsDeleteModalOpen(false);
        setIsEdit(false);
        router.push("/selling");
      })
      .catch((err) => {
        toast.error(err?.data?.message || error_messages.something_went_wrong);
      });
  };
  return (
    <div className="">
      <Modal
        editModalRef={deleteModalRef}
        open={isDeleteModalOpen}
        setOpen={setIsDeleteModalOpen}
        centered={true}
      >
        <div className="bg-white rounded-[12px] w-[92vw] max-w-[390px] p-5 shadow-xl hide-scrollbar">
          <h2 className="text-[16px] font-semibold text-black-1">
            {placeholders.delete_product}
          </h2>
          <p className="text-[14px] text-gray-8 mt-2">
            {placeholders[
              "are_you_sure_you_want_to_delete_this_product" as keyof typeof placeholders
            ] ?? "Are you sure you want to delete this product?"}
          </p>
          <div className="mt-5 flex gap-3">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="h-[40px] flex-1 cursor-pointer rounded-[8px] border border-green-1 text-green-1 text-[14px] font-medium"
            >
              {placeholders.cancel}
            </button>
            <button
              disabled={isDeleteLoading}
              onClick={handleDeleteProduct}
              className="h-[40px] cursor-pointer flex-1 rounded-[8px] border border-[#E92440] bg-[#E92440] text-white text-[14px] font-medium disabled:opacity-60"
            >
              {isDeleteLoading ? <BeatLoader color="white" size={8} /> : placeholders.confirm}
            </button>
          </div>
        </div>
      </Modal>
      <div className="h-full min-h-screen flex flex-col items-center">
        <div className="px-5 sm:px-10 min-h-[61px] border-b-[1px] border-gray-9 bg-white w-full  flex justify-center">
          <div className="w-full   flex flex-wrap items-center gap-[6px] font-normal text-[14px] mt-5">
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
                      className={`h-[96px] w-[96px] border-[4px] object-cover rounded-[10px] cursor-pointer ${type === "video"
                        ? " border-green-1"
                        : "border-transparent"
                        }`}
                    />
                  )}
                </div>
              </div>
              <div className="w-full sm:max-w-[364px] ">
                <div className="space-y-2 sm:space-y-0 items-center flex justify-between ">
                  <div className="flex gap-2 items-center">
                    <Image
                      className="h-[44px] w-[44px] rounded-full object-cover bg-gray-12"
                      src={
                        product?.data?.shopId && shopData?.image
                          ? shopData.image
                          : product?.data?.ownerId && ownerData?.image
                            ? ownerData.image
                            : noImageAvtar
                      }
                      alt="profile"
                      unoptimized
                      height={100}
                      width={100}
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
                          onClick={() => {
                            setIsEdit(false);
                            setIsDeleteModalOpen(true);
                          }}
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

              </div>
            </div>
            <Reviews type="product" id={product?.data?.id || product?.data?._id} allowAddReview={allowedToBuy} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
