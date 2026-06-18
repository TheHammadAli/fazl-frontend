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
import { useGetProductOwnerDetailQuery } from "@/store/services/authService";
import { getFeedCategoryLabel } from "@/utils/getFeedCategoryLabel";
import { useAppDispatch } from "@/store/store";
import { addToCart } from "@/store/reducers/cartReducer";
import toast from "react-hot-toast";
import { useRequireSignIn } from "@/custom-hooks/useRequireSignIn";
import Modal from "../Ui/Modals/Modal";
import SharePostModal from "../Ui/SharePostModal";
import shareSimpleIcon from "@/assets/icons/share-simple.svg";
import {
  useLikeVideoMutation,
  useUnlikeVideoMutation,
} from "@/store/services/feedService";

function buildWhatsAppUrl(phone: string, message: string) {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.881 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

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
  const { pages, placeholders, currentLanguage, info_messages, error_messages } = useDictionary();
  const ref = React.useRef<HTMLDivElement>(null);
  const sharePostRef = React.useRef<HTMLDivElement>(null);
  const [toggle, setToggle] = useState(-1);
  const [type, setType] = useState("image");
  const [typeIndex, setTypeIndex] = useState(0);
  const [shareModal, setShareModal] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const isLikePendingRef = React.useRef(false);
  const productId = product?.data?.id ?? product?.data?._id ?? "";
  useClickOutside(ref, () => {
    setToggle(-1);
  });
  const isClassified = product?.data?.type === "classified";
  const { data: avgReview } = useGetAvgReviewsQuery(
    { type: "product", id: product?.data?.id ?? "" },
    { skip: !product?.data?.id || isClassified },
  );

  const reviewCount = avgReview?.data?.count ?? 0;
  const isOwner = product?.data?.shopId
    ? Boolean(userId) && userId === shopData?.ownerId
    : Boolean(userId) && userId === ownerData?.id;
  const allowedToBuy = !isOwner;
  const allowMessageAndReview = !isOwner && !isClassified;
  const showPurchaseActions = allowedToBuy && !isClassified;
  const showWhatsAppContact = allowedToBuy && isClassified;

  const sellerPhoneFromProduct = product?.data?.shopId
    ? shopData?.ownerId?.phone
    : ownerData?.phone;
  const sellerUserId = product?.data?.shopId
    ? typeof shopData?.ownerId === "object"
      ? shopData?.ownerId?.id
      : shopData?.ownerId
    : ownerData?.id;
  const { data: sellerDetail } = useGetProductOwnerDetailQuery(sellerUserId ?? "", {
    skip: !isClassified || !sellerUserId || Boolean(sellerPhoneFromProduct),
  });
  const sellerPhone = sellerPhoneFromProduct ?? sellerDetail?.data?.phone;

  const [likeVideo, { isLoading: isLikeLoading }] = useLikeVideoMutation();
  const [unlikeVideo, { isLoading: isUnlikeLoading }] = useUnlikeVideoMutation();

  const [mounted, setMounted] = useState(false);
  const showLikeAndShare = mounted && Boolean(userId);

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

  useEffect(() => {
    if (isLikePendingRef.current) return;
    setIsLiked(Boolean(product?.data?.isLiked));
  }, [product?.data?.isLiked, productId]);

  const onLikeClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!productId || isLikeLoading || isUnlikeLoading) return;

    const prevIsLiked = isLiked;
    const nextIsLiked = !prevIsLiked;
    isLikePendingRef.current = true;
    setIsLiked(nextIsLiked);

    const req = prevIsLiked
      ? unlikeVideo({ itemId: productId, itemType: "product" }).unwrap()
      : likeVideo({
          itemId: productId,
          itemType: "product",
          ownerModel: product?.data?.shopId ? "Shop" : "User",
        }).unwrap();

    req
      .catch(() => {
        setIsLiked(prevIsLiked);
        toast.error(error_messages.something_went_wrong);
      })
      .finally(() => {
        isLikePendingRef.current = false;
      });
  };

  const onShareClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setShareModal(true);
  };

  const shareUrl =
    mounted && productId
      ? `${window.location.origin}/buy-product?id=${productId}`
      : "";

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

  const handleWhatsAppContact = () => {
    if (!sellerPhone) {
      toast.error(error_messages.seller_phone_unavailable);
      return;
    }

    const message = `${info_messages.whatsapp_product_inquiry}: ${product?.data?.title ?? ""}`;
    const url = buildWhatsAppUrl(sellerPhone, message);
    if (!url) {
      toast.error(error_messages.seller_phone_unavailable);
      return;
    }

    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="">
      <Modal
        editModalRef={sharePostRef}
        open={shareModal}
        setOpen={setShareModal}
        centered={true}
      >
        <SharePostModal
          type={placeholders.product}
          setShareModal={setShareModal}
          shareUrl={shareUrl}
          shareService={true}
        />
      </Modal>
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
                <div className="relative   h-[280px] min-w-[250px] sm:h-[320px] md:h-[500px] max-w-[496px] xl:w-[496px] overflow-hidden rounded-[10px]">
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
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <video
                      src={`${videoSrc}?t=${Date.now()}`}
                      controls
                      autoPlay={false}
                      className="h-full w-full object-contain"
                    />
                  )}
                  {showLikeAndShare && (
                    <div className="absolute top-4 z-10 flex items-center gap-3 ltr:right-4 rtl:left-4">
                      <button
                        type="button"
                        onClick={onLikeClick}
                        className={`flex h-12 w-12 cursor-pointer items-center justify-center rounded-full text-white ${isLiked ? "bg-black" : "bg-[#f2f2f2]/50"}`}
                        aria-label="Like"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          stroke={isLiked ? undefined : "black"}
                          strokeWidth={isLiked ? undefined : 2}
                          fill={isLiked ? "white" : "none"}
                          className="h-6 w-6"
                        >
                          <path d="M2.25 10.5a2.25 2.25 0 0 1 2.25-2.25h2.4a1.5 1.5 0 0 0 1.42-.99l1.59-4.37a1.5 1.5 0 0 1 2.84.95l-.55 4.41H18a3 3 0 0 1 2.95 3.55l-1.1 6a3 3 0 0 1-2.95 2.45H9.75a3 3 0 0 1-3-3v-6.75H4.5a2.25 2.25 0 0 1-2.25-2.25Z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={onShareClick}
                        className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-[#f2f2f2]/50 text-white"
                        aria-label="Share"
                      >
                        <Image
                          className="h-6 w-6"
                          src={shareSimpleIcon}
                          alt="share-simple-icon"
                        />
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex gap-1 flex-wrap max-w-[496px] ">
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
                {!isClassified && (
                  <h3 className="font-light text-[14px] text-[#4B514F] ">
                    {reviewCount} {reviewCount === 1 ? placeholders.review : placeholders.reviews}
                  </h3>
                )}
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
                  showPurchaseActions &&
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
                {mounted && showPurchaseActions && (
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
                {mounted && showPurchaseActions && (
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
                {mounted && showWhatsAppContact && (
                  <button
                    type="button"
                    onClick={handleWhatsAppContact}
                    className="mt-8 flex h-[46px] w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#25D366] bg-[#25D366] text-[16px] font-medium text-white hover:bg-[#1ebe57]"
                  >
                    <WhatsAppIcon className="h-5 w-5 shrink-0" />
                    {placeholders.contact_seller_on_whatsapp}
                  </button>
                )}
              </div>
            </div>

            {!isClassified && (
              <Reviews type="product" id={product?.data?.id} allowAddReview={allowMessageAndReview} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BuyProductDetail;
