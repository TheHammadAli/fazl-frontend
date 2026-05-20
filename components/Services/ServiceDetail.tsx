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
import { useDeleteServiceMutation, useGetShopDetailQuery } from "@/store/services/sellingService";
import threeDots from "@/assets/icons/three-dots.svg";
import { useRouter } from "next/navigation";
import Reviews from "../Ui/Reviews";
import { getUserId } from "@/utils/getUserId";
import { useGetAvgReviewsQuery } from "@/store/services/reviewService";
import Modal from "../Ui/Modals/Modal";
import toast from "react-hot-toast"
import { BeatLoader } from "react-spinners";

export type ServiceDetailProps = {
  // setStep?: (val: "product" | "cart") => void;
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
};
export type ServiceDetailType = {
  id: string;
  _id: string;
  ownerId: string;
  title: string;
  name: string;
  price: number;
  images: string[];
  video: string;
  description: string;
  parameters: { name: string; variants: string[] }[];
  category: { name: string };
  updatedAt: string;
};
function ServiceDetail({ serviceData }: { serviceData: ServiceDetailType }) {
  const router = useRouter();
  const { user } =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user") || "{}")
      : null;
  const serviceId = serviceData?.id ?? serviceData?._id;
  const userId = getUserId() ?? "";
  const { data: avgReview, isLoading: isLoadingAvgReview } = useGetAvgReviewsQuery(
    { type: "service", id: serviceId },
    { skip: !serviceId }

  );
  const reviewCount = avgReview?.data?.count ?? 0;
  const { pages, placeholders, info_messages, error_messages } =
    useDictionary();
  const ref = React.useRef<HTMLDivElement>(null);
  const [toggle, setToggle] = useState(-1);
  const [isEdit, setIsEdit] = useState(false);
  const [type, setType] = useState("image");
  const [typeIndex, setTypeIndex] = useState(0);
  const [videoVersion, setVideoVersion] = useState(0);
  const allowedToBuy = userId !== serviceData?.ownerId;
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteService, { isLoading: isDeleteLoading }] = useDeleteServiceMutation();
  const deleteModalRef = React.useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => {
    setToggle(-1);
  });
  useClickOutside(ref, () => {
    setIsEdit(false);
  });
  useEffect(() => {
    if (serviceData?.video) {
      setVideoVersion((v) => v + 1);
    }
  }, [serviceData?.video]);
  const handleDeleteService = () => {
    if (!serviceId) return;
    deleteService(serviceId)
      .unwrap()
      .then((res) => {
        toast.success(res?.message || placeholders.delete_service);
        setIsDeleteModalOpen(false);
        setIsEdit(false);
        router.push("/services");
      })
      .catch((err) => {
        toast.error(err?.data?.message || error_messages.something_went_wrong);
      });
  };
  return (
    <div>
      <Modal
        editModalRef={deleteModalRef}
        open={isDeleteModalOpen}
        setOpen={setIsDeleteModalOpen}
        centered={true}
      >
        <div className="bg-white rounded-[12px] w-[92vw] max-w-[390px] p-5 shadow-xl !hide-scrollbar">
          <h2 className="text-[16px] font-semibold text-black-1">
            {placeholders.delete_service}
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
              onClick={handleDeleteService}
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
            <span className="text-gray-8 capitalize">
              {placeholders.service}
            </span>
            <Image
              src={chevron}
              alt="chevron"
              className="-rotate-90 rtl:rotate-90"
            />
            <span className="text-green-1">{serviceData?.title}</span>
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
                        serviceData?.images?.length > 0
                          ? `${serviceData?.images?.[typeIndex]
                          }?t=${Date.now()}`
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
                      key={`${serviceData?.video}?v=${serviceData?.updatedAt}`}
                      src={`${serviceData?.video}?v=${serviceData?.updatedAt}`}
                      controls
                      autoPlay={false}
                      className=" h-full w-full object-contain"
                    />
                  )}
                </div>
                <div className="flex gap-1 flex-wrap max-w-[496px]">
                  {serviceData?.images?.map((image: string, index: number) => (
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
                        src={`${image}?t=${Date.now()}`}
                        height={100}
                        width={100}
                        alt="product"
                        unoptimized
                        className="h-[96px] w-[96px] object-cover  "
                      />
                    </div>
                  ))}

                  {serviceData?.video && (
                    <video
                      onClick={() => setType("video")}
                      key={`${serviceData?.video}?v=${serviceData?.updatedAt}`}
                      src={`${serviceData?.video}?v=${serviceData?.updatedAt}`}
                      controls={false}
                      className={`h-[96px] w-[96px] border-[4px] object-cover rounded-[10px] cursor-pointer ${type === "video"
                        ? " border-green-1"
                        : "border-transparent"
                        }`}
                    />
                  )}
                </div>
              </div>
              <div className="w-full sm:max-w-[364px]  ">
                <div className="space-y-2 sm:space-y-0 flex justify-between ">
                  <div className="flex gap-2">
                    <Image
                      className="h-[44px] w-[44px] rounded-full object-cover bg-gray-12"
                      src={user?.image ?? noImageAvtar}
                      alt="profile"
                      height={100}
                      width={100}
                      unoptimized
                    />
                    <div>
                      <h4 className="text-[#030303] text-[14px]">
                        {user?.name ?? ""}
                      </h4>
                      <h4 className="text-[#4B514F] text-[14px] font-light">
                        {user?.email ?? ""}
                      </h4>
                    </div>
                  </div>
                  <div className=" cursor-pointer relative " ref={ref}>
                    <div className="p-2 " onClick={() => setIsEdit(true)}>
                      <Image src={threeDots} alt="threeDots" />
                    </div>

                    {isEdit && (
                      <div className="absolute p-1 shadow-xl right-0 top-6 border-[0.5px] border-[#00000033] rounded-[6px] bg-white w-[136px]">
                        <div
                          onClick={() => {
                            setIsEdit(false);

                            router.push(
                              `/services/update-service/${serviceData?.id}`
                            );
                          }}
                          className="p-[10px] text-[12px] leading-none hover:bg-green-3"
                        >
                          {placeholders.edit_service}
                        </div>
                        <button

                          onClick={() => {
                            setIsEdit(false);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-[8px] w-full text-start text-[12px] leading-none hover:bg-green-3"
                        >
                          {placeholders.delete_service}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <h3 className="text-[#030303] text-[16px] font-medium mt-4">
                  {serviceData.title ?? ""}
                </h3>
                <h3 className="font-light text-[14px] text-[#4B514F] ">
                  {reviewCount} {reviewCount === 1 ? placeholders.review : placeholders.reviews}
                </h3>
                <div className="space-x-2 mt-4">
                  <span className="text-green-1 text-[16px] font-medium">
                    {placeholders.Rs} {serviceData?.price ?? ""}
                  </span>
                </div>
                <div className="text-[#4B514F] text-[14px] font-light mt-4 ">
                  {placeholders.description}
                </div>
                <p className="text-[15px] text-[#030303] font-light break-all">
                  {serviceData?.description ?? ""}
                </p>
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
                {/* <button
                  //   disabled={
                  //     Object.keys(selectedVariants).length !==
                  //     product?.data?.parameters?.length
                  //   }
                  //   onClick={() => setStep && setStep("cart")}
                  className="h-[46px] disabled:opacity-50 disabled:pointer-events-none mt-4 border-green-1 bg-green-1 border-[1px] w-full rounded-xl flex items-center justify-center font-medium text-[16px] text-white hover:text-green-1 hover:bg-white cursor-pointer"
                >
                  {placeholders.promote_service}
                </button> */}
              </div>
            </div>
            <Reviews type="service" id={serviceData?.id} allowAddReview={allowedToBuy} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ServiceDetail;
