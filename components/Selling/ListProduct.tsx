"use client";
import React, { useEffect, useRef, useState } from "react";
import chevron from "@/assets/icons/chev-down-icon.svg";
import Image from "next/image";
import { useDictionary } from "@/dictionaries/DictionaryProvider";
import Tabs from "../Ui/Tabs";
import ChooseImagesTab from "../Services/ChooseImagesTab";
import ChooseVideoTab from "../Services/ChooseVideoTab";
import cameraIcon from "@/assets/icons/camera-icon.svg";
import { BeatLoader } from "react-spinners";
import Modal from "../Ui/Modals/Modal";
import CategoryModal, { categroyTypes } from "../Services/CategoryModal";
import PriceModal, { priceTypes } from "../Services/PriceModal";
import {
  useAddServiceMutation,
  useListProductMutation,
} from "@/store/services/sellingService";
import toast from "react-hot-toast";
import ServiceCreated from "../Services/ServiceCreated";
import AddParameterModal, { parameterTypes } from "./AddParameterModal";
import plusIcon from "@/assets/icons/green-plus-icon.svg";
import AddParameterValueModal from "./AddParameterValueModal";
import TypeModal from "./TypeModal";
import { useSearchParams } from "next/navigation";
import ProductListed from "./ProductListed";
import { getCookie } from "cookies-next";

function ListProduct() {
  const categoryRef = useRef<HTMLDivElement | null>(null);
  const { pages, placeholders, info_messages, error_messages } =
    useDictionary();
  const [listProduct, { data, isLoading, isError, isSuccess, error }] =
    useListProductMutation();
  const [status, setStatus] = useState("form");
  const [createdData, setCreatedData] = useState<{ id: string }>({ id: "" });
  const tabs = ["photos_tab", "video_tab"];
  const [activeTab, setActiveTab] = useState<string>(tabs[0]);
  const [images, setImages] = useState<(File | string)[]>([]);
  const [video, setVideo] = useState<File | null | string>(null);

  const tabsComponents: { [key: string]: React.ReactNode } = {
    photos_tab: <ChooseImagesTab images={images} setImages={setImages} />,
    video_tab: <ChooseVideoTab video={video} setVideo={setVideo} />,
  };
  const [title, setTitle] = useState("");
  const [titleError, setTitleError] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const [typeError, setTypeError] = useState("");
  const [isCatOpen, setIsCatOpen] = useState(false);
  const [isPriceOpen, setIsPriceOpen] = useState(false);
  const [isTypeOpen, setIsTypeOpen] = useState(false);
  const [isParameterOpen, setIsParameterOpen] = useState(false);
  const [isParameterValueOpen, setIsParameterValueOpen] = useState(false);
  const [priceError, setPriceError] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<categroyTypes | null>(null);
  const [categoryError, setCategoryError] = useState("");
  const [selectedPrice, setSelectedPrice] = useState<priceTypes>({
    paymentType: "fixed",
    price: "",
  });
  const [index, setIndex] = useState<number | null>(0);
  const [parameters, setParameters] = useState<parameterTypes[]>([]);
  const [parameterError, setParameterError] = useState("");
  const id = useSearchParams().get("id") || "";
  const productType = useSearchParams().get("type") || "";
  const userId = typeof window !== "undefined" ? getCookie("userId") : "";

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTitleError("");
    setDescriptionError("");
    setCategoryError("");
    setPriceError("");
    setTypeError("");
    setParameterError("");

    if (title === "") {
      setTitleError(error_messages.title_required);
    }
    if (description === "") {
      setDescriptionError(error_messages.description_required);
    }
    if (type === "") {
      setTypeError(error_messages.type_required);
    }
    if (selectedCategory === null) {
      setCategoryError(error_messages.category_required);
    }
    if (selectedPrice.price === "") {
      setPriceError(error_messages.price_required);
    }
    // if (video === null || video === "") {
    //   toast.error(error_messages.video_required);
    //   return null;
    // }
    if (parameters.length === 0) {
      setParameterError(error_messages.parameter_required);
    }
    if (parameters.some((parameter) => parameter.variants.length === 0)) {
      setParameterError(error_messages.parameter_value_required);
    }
    if (images?.length === 0) {
      toast.error(error_messages.image_required);
      return;
    }

    if (
      title !== "" &&
      description !== "" &&
      selectedCategory !== null &&
      selectedPrice.price !== "" &&
      type !== "" &&
      video !== null &&
      video !== "" &&
      images?.length > 0 &&
      parameters.length > 0 &&
      parameters.some((parameter) => parameter.variants.length > 0)
    ) {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("category", selectedCategory._id);
      formData.append("price", selectedPrice.price);
      formData.append("type", type);
      formData.append("video", video);
      if (parameters.length > 0) {
        formData.append("parameters", JSON.stringify(parameters));
      }

      if (images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          formData.append("images", images[i]);
        }
      }
      listProduct({
        id: productType && productType === "personal" ? userId : id,
        formData,
        type: productType && productType === "personal" ? "personal" : "shop",
      });
    }
  };
  useEffect(() => {
    if (isSuccess) {
      toast.success(data?.message);
      const timer = setTimeout(() => {
        setStatus("success");
        setCreatedData(data?.data);
      }, 800);

      return () => clearTimeout(timer);
    }
    if (isError && "data" in error) {
      setSelectedCategory(null);
      setSelectedPrice({ paymentType: "fixed", price: "" });
      setImages([]);
      setVideo(null);
      setTitle("");
      setDescription("");
      setParameters([]);
      setType("");
      toast.error(
        (error?.data as { message?: string })?.message ||
        "something went wrong!"
      );
    }
  }, [isSuccess, isError, data, error]);
  return (
    <>
      <Modal
        editModalRef={categoryRef}
        open={isCatOpen}
        setOpen={setIsCatOpen}
        centered={false}
      >
        <div className=" h-full w-full flex justify-center pt-[80px]">
          <CategoryModal
            setIsCatOpen={setIsCatOpen}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />
        </div>
      </Modal>
      <Modal
        editModalRef={categoryRef}
        open={isPriceOpen}
        setOpen={setIsPriceOpen}
        centered={false}
      >
        <div className=" h-full w-full flex justify-center pt-[80px]">
          <PriceModal
            selectedPrice={selectedPrice}
            setSelectedPrice={setSelectedPrice}
            setIsPriceOpen={setIsPriceOpen}

          // setIsCatOpen={setIsCatOpen}
          // selectedCategory={selectedCategory}
          // setSelectedCategory={setSelectedCategory}
          />
        </div>
      </Modal>
      <Modal
        editModalRef={categoryRef}
        open={isParameterOpen}
        setOpen={setIsParameterOpen}
        centered={false}
      >
        <div className=" h-full w-full flex justify-center pt-[80px]">
          <AddParameterModal
            parameters={parameters}
            setParameters={setParameters}
            setIsParameterOpen={setIsParameterOpen}
          />
        </div>
      </Modal>
      <Modal
        editModalRef={categoryRef}
        open={isParameterValueOpen}
        setOpen={setIsParameterValueOpen}
        centered={false}
      >
        <div className=" h-full w-full flex justify-center pt-[80px]">
          <AddParameterValueModal
            parameters={parameters}
            setParameters={setParameters}
            index={index}
            setIsParameterOpen={setIsParameterValueOpen}
          />
        </div>
      </Modal>
      <Modal
        editModalRef={categoryRef}
        open={isTypeOpen}
        setOpen={setIsTypeOpen}
        centered={false}
      >
        <div className=" h-full w-full flex justify-center pt-[80px]">
          <TypeModal
            type={type}
            setType={setType}
            setIsTypeOpen={setIsTypeOpen}
          />
        </div>
      </Modal>
      <div className="h-full min-h-screen flex flex-col items-center">
        <div className="px-6 h-[61px] border-b-[1px] border-gray-9 bg-white w-full  flex justify-center">
          <div className="w-full   flex items-center gap-[6px] font-normal text-[14px] mt-5">
            <span className="text-gray-8">{pages.selling}</span>
            <Image
              src={chevron}
              alt="chevron"
              className="-rotate-90 rtl:rotate-90"
            />
            <span className="text-gray-8">{placeholders.private_listing}</span>
            <Image
              src={chevron}
              alt="chevron"
              className="-rotate-90 rtl:rotate-90"
            />
            <span className="text-green-1">{placeholders.sell_product}</span>
          </div>
        </div>
        {status === "success" ? (
          <ProductListed setStatus={setStatus} />
        ) : (
          <div className="md:flex w-full flex-1">
            <div className="md:w-[46%] p-4 md:p-6 border-b md:border-r border-gray-9 ">
              <div>
                <Tabs
                  tabs={tabs}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                />
                {tabsComponents[activeTab]}
              </div>
              <div className="px-[6px] mt-[60px] py-2 rounded-[10px] gap-[10px] flex items-start bg-green-4">
                <Image src={cameraIcon} alt="cam_icon" />
                <h4 className="text-black-1 font-light text-[14px] w-[244px] leading-tight">
                  {info_messages.catch_your_buyer}
                </h4>
              </div>
            </div>
            <div className="md:w-[54%] p-4 md:px-6">
              <form
                onSubmit={handleSubmit}
                className={`w-full  max-w-[390px] 
             ${isLoading && "pointer-events-none"}
          `}
              >
                {/*  title */}
                <div className="space-y-1 mt-5 w-full">
                  <p
                    className={`text-[14px] font-normal  ${titleError ? "text-red-1" : "text-gray-8"
                      }`}
                  >
                    {placeholders.title}
                  </p>
                  <input
                    type="text"
                    value={title}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setTitle(e.target.value)
                    }
                    className="h-[28px] text-[15px] text-black-1 font-normal focus:outline-none w-full border-gray-9 border-b-[1px] "
                  />
                  {titleError && (
                    <p className="text-red-1 text-[14px] font-normal">
                      {titleError}
                    </p>
                  )}
                </div>
                {/* descripton */}
                <div className="space-y-1 mt-5 w-full">
                  <p
                    className={`text-[14px] font-normal  ${descriptionError ? "text-red-1" : "text-gray-8"
                      }`}
                  >
                    {info_messages?.describe_product}
                  </p>
                  <textarea
                    value={description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setDescription(e.target.value)
                    }
                    draggable={false}
                    className="h-[132px] resize-none text-[15px] text-black-1 font-normal focus:outline-none w-full border-gray-9 border-b-[1px] "
                  />
                  {descriptionError && (
                    <p className="text-red-1 text-[14px] font-normal">
                      {descriptionError}
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-between h-[40px] px-4 border-b-[1px] border-gray-9">
                  <h3 className="text-[15px] leading-none font-medium text-black-1">
                    {placeholders.type}
                  </h3>
                  <div
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => setIsTypeOpen(true)}
                  >
                    <h4 className="text-[15px] font-normal text-gray-8 leading-none">
                      {placeholders?.[type as keyof typeof placeholders] ||
                        placeholders.choose_type}
                    </h4>
                    <Image
                      src={chevron}
                      alt="chevron"
                      className="-rotate-90 rtl:rotate-90 w-4"
                    />
                  </div>
                </div>
                {typeError && (
                  <p className="text-red-1 text-[14px] font-normal">
                    {typeError}
                  </p>
                )}
                <div className="bg-gray-12  mt-2  h-[27px] "></div>
                {/* category */}
                <div className="bg-white h-[50px] flex items-center justify-between border-b-[1px] border-gray-9  px-4">
                  <h3 className="text-[15px] font-medium text-black-1">
                    {placeholders.category}
                  </h3>
                  <div
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => setIsCatOpen(true)}
                  >
                    <h4 className="text-[15px] font-normal text-gray-8 leading-none">
                      {selectedCategory?.name || placeholders.choose_category}
                    </h4>
                    <Image
                      src={chevron}
                      alt="chevron"
                      className="-rotate-90 rtl:rotate-90 w-4"
                    />
                  </div>
                </div>
                {categoryError && (
                  <p className="text-red-1 text-[14px] font-normal">
                    {categoryError}
                  </p>
                )}
                {/* mapping the parameters */}
                {parameters?.map((parameter, index) => (
                  <div
                    key={index}
                    className="bg-white h-[50px] flex items-center justify-between border-b-[1px] border-gray-9  px-4"
                  >
                    <h3 className="text-[15px] font-medium text-black-1">
                      {parameter.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span>{parameter?.variants?.join(", ")} </span>
                      <div
                        className=" cursor-pointer"
                        onClick={() => {
                          setIndex(index);
                          setIsParameterValueOpen(true);
                        }}
                      >
                        <Image
                          src={chevron}
                          alt="chevron"
                          className="-rotate-90 rtl:rotate-90 w-4"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {/* add parameter */}
                <div className="border-b-[1px] border-gray-9">
                  <div
                    className="w-max flex items-center cursor-pointer gap-2   my-4 ml-[15px] "
                    onClick={() => setIsParameterOpen(true)}
                  >
                    <Image src={plusIcon} alt="plus_icon" />
                    <h3 className="text-green-1 font-normal text-[15px]">
                      {placeholders.add_parameter}
                    </h3>
                  </div>
                </div>
                {parameterError && (
                  <p className="text-red-1 text-[14px] font-normal">
                    {parameterError}
                  </p>
                )}
                <div className="bg-gray-12   h-[27px] "></div>
                {/* price */}
                <div className="bg-white h-[50px] flex items-center justify-between px-4">
                  <h3 className="text-[15px] font-medium text-black-1">
                    {placeholders.price}
                  </h3>
                  <div
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => setIsPriceOpen(true)}
                  >
                    <h4 className="text-[15px] font-normal text-gray-8 leading-none">
                      {selectedPrice?.price + "-/" + (placeholders?.[selectedPrice?.paymentType as keyof typeof placeholders] ?? "Fixed")}
                    </h4>
                    <Image
                      src={chevron}
                      alt="chevron"
                      className="-rotate-90 rtl:rotate-90 w-4"
                    />
                  </div>
                </div>
                {priceError && (
                  <p className="text-red-1 text-[14px] font-normal">
                    {priceError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="mt-3   h-[46px] w-full rounded-[12px] text-white font-medium text-[16px]  bg-green-1 cursor-pointer"
                >
                  {isLoading ? (
                    <BeatLoader color="white" size={8} />
                  ) : (
                    placeholders.upload
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default ListProduct;
