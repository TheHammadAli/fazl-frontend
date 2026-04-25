import React, { useState } from "react";
import chevDown from "@/assets/icons/chev-down-icon.svg";
import crossIcon from "@/assets/icons/cross-icon.svg";
import Image from "next/image";
import { useGetAllCategoriesQuery } from "@/store/services/sellingService";
import { toast } from "react-hot-toast";
import { useBroadcastMessageMutation } from "@/store/services/chatService";
import { useDictionary } from "@/dictionaries/DictionaryProvider";

type CategoryItem = {
    _id: string;
    name: string;
};
type BroadcastType = "product" | "service";
function BroadCastModal({ setOpenBroadcast }: { setOpenBroadcast: (open: boolean) => void }) {
    const SUCCESS_TOAST_DURATION = 1500;
    const { placeholders, error_messages } = useDictionary();
    type PlaceholderKey = keyof typeof placeholders;
    type ErrorKey = keyof typeof error_messages;
    const ph = (key: PlaceholderKey) => placeholders[key];
    const eh = (key: ErrorKey) => error_messages[key];
    const [isRadiusOpen, setIsRadiusOpen] = useState(false);
    const [selectedRadius, setSelectedRadius] = useState<number | null>(null);
    const [isTypeOpen, setIsTypeOpen] = useState(false);
    const [selectedType, setSelectedType] = useState<BroadcastType | null>(null);
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<CategoryItem | null>(null);
    const { data: categories, isLoading: isCategoriesLoading, isFetching: isCategoriesFetching } = useGetAllCategoriesQuery("");
    const [message, setMessage] = useState("");
    const [broadcastMessage, { isLoading: isBroadcastLoading }] = useBroadcastMessageMutation();
    const handleSendMessage = async () => {

        if (selectedRadius === null) {
            toast.error(eh("radius_required"));
            return;
        }
        if (selectedType === null) {
            toast.error(eh("type_required"));
            return;
        }
        if (selectedCategory === null) {
            toast.error(eh("category_required"));
            return;
        }

        if (message.trim() === "") {
            toast.error(eh("message_required"));
            return;
        }
        const body = {
            type: selectedType,
            message: message,
            radius: selectedRadius,
            categoryId: selectedCategory._id,
        };
        try {
            const res = await broadcastMessage(body).unwrap();
            toast.success(res.message, { duration: SUCCESS_TOAST_DURATION });
            setTimeout(() => {
                setOpenBroadcast(false);
            }, SUCCESS_TOAST_DURATION);
        } catch (error) {
            toast.error((error as { data?: { message?: string } })?.data?.message || eh("something_went_wrong"));
        }

    };
    return (
        <div className="w-full max-w-[514px] overflow-hidden rounded-[12px] bg-white">
            <div className="flex items-center justify-between border-b border-gray-9 px-5 py-4">
                <h2 className="text-[16px] font-semibold text-black-1">{ph("broadcast_message_title")}</h2>
                <button
                    onClick={() => setOpenBroadcast(false)}
                    disabled={isBroadcastLoading}
                    type="button"
                    className="cursor-pointer text-[#111827] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <Image src={crossIcon} alt="cross-icon" className="w-3 h-3" />
                </button>
            </div>

            <div className={`space-y-8 px-5 py-6 ${isBroadcastLoading ? "pointer-events-none opacity-70" : ""}`}>
                <div className="relative border-b border-gray-9 pb-2">
                    <p className="mb-1 text-[14px] font-normal text-gray-8">{ph("set_radius")}</p>
                    <button
                        disabled={isBroadcastLoading}
                        type="button"
                        onClick={() => {
                            setIsRadiusOpen((prev) => !prev);
                            setIsTypeOpen(false);
                            setIsCategoryOpen(false);
                        }}
                        className="flex w-full cursor-pointer items-center justify-between text-left disabled:cursor-not-allowed"
                    >
                        <span className="text-[15px] font-normal text-gray-8">
                            {selectedRadius != null ? `${selectedRadius} km` : ph("choose_radius")}
                        </span>
                        <Image src={chevDown} alt="cross-icon" className="cursor-pointer" />
                    </button>
                    {isRadiusOpen ? (
                        <div className="absolute left-0 right-0 top-[62px] z-20 max-h-[200px] overflow-y-auto rounded-[8px] border border-gray-9 bg-white shadow-md">
                            {Array.from({ length: 100 }, (_, idx) => idx + 1).map((radius) => (
                                <button
                                    key={radius}
                                    type="button"
                                    className="w-full cursor-pointer border-b border-gray-9 px-3 py-2 text-left text-[14px] text-black-1 last:border-b-0 hover:bg-gray-10"
                                    onClick={() => {
                                        setSelectedRadius(radius);
                                        setIsRadiusOpen(false);
                                    }}
                                >
                                    {radius} km
                                </button>
                            ))}
                        </div>
                    ) : null}
                </div>

                <div className="relative border-b border-gray-9 pb-2">
                    <p className="mb-1 text-[14px] font-normal text-gray-8">{ph("type")}</p>
                    <button
                        disabled={isBroadcastLoading}
                        type="button"
                        onClick={() => {
                            setIsTypeOpen((prev) => !prev);
                            setIsRadiusOpen(false);
                            setIsCategoryOpen(false);
                        }}
                        className="flex w-full cursor-pointer items-center justify-between text-left disabled:cursor-not-allowed"
                    >
                        <span className="text-[15px] first-letter:capitalize font-normal text-gray-8">
                            {selectedType ?? ph("choose_type")}
                        </span>
                        <Image src={chevDown} alt="chev-down" />
                    </button>
                    {isTypeOpen ? (
                        <div className="absolute left-0 right-0 top-[62px] z-20 max-h-[200px] overflow-y-auto rounded-[8px] border border-gray-9 bg-white shadow-md">
                            {([
                                { value: "product", label: ph("product") },
                                { value: "service", label: ph("service") },
                            ] as { value: BroadcastType; label: string }[]).map((type) => (
                                <button
                                    key={type.value}
                                    type="button"
                                    className="w-full cursor-pointer border-b border-gray-9 px-3 py-2 text-left text-[14px] text-black-1 last:border-b-0 hover:bg-gray-10"
                                    onClick={() => {
                                        setSelectedType(type.value);
                                        setIsTypeOpen(false);
                                    }}
                                >
                                    <p className="first-letter:uppercase">{type.label}</p>
                                </button>
                            ))}
                        </div>
                    ) : null}
                </div>

                <div className="relative border-b border-gray-9 pb-2 ">
                    <p className="mb-1 text-[14px] font-normal text-gray-8">{ph("category")}</p>
                    <button
                        disabled={isBroadcastLoading}
                        type="button"
                        onClick={() => {
                            setIsCategoryOpen((prev) => !prev);
                            setIsRadiusOpen(false);
                            setIsTypeOpen(false);
                        }}
                        className="flex cursor-pointer w-full items-center justify-between text-left disabled:cursor-not-allowed"
                    >
                        <span className="text-[15px] font-normal text-gray-8">
                            {selectedCategory?.name ?? "Choose category"}
                        </span>
                        <Image src={chevDown} alt="cross-icon" />
                    </button>
                    {isCategoryOpen ? (
                        <div className="absolute  left-0 right-0 top-[62px] z-20 max-h-[200px] overflow-y-auto rounded-[8px] border border-gray-9 bg-white shadow-md">
                            {isCategoriesLoading || isCategoriesFetching ? (
                                <p className="px-3 py-2 text-[14px] text-gray-8">{ph("loading_categories")}</p>
                            ) : categories?.data?.length > 0 ? (
                                categories.data.map((category: CategoryItem) => (
                                    <button
                                        key={category._id}
                                        type="button"
                                        className="w-full cursor-pointer border-b border-gray-9 px-3 py-2 text-left text-[14px] text-black-1 last:border-b-0 hover:bg-gray-10"
                                        onClick={() => {
                                            setSelectedCategory(category);
                                            setIsCategoryOpen(false);
                                        }}
                                    >
                                        {category.name}
                                    </button>
                                ))
                            ) : (
                                <p className="px-3 py-2 text-[14px] text-gray-8">{ph("no_categories_found")}</p>
                            )}
                        </div>
                    ) : null}
                </div>

                <div className=" ">
                    <p className="mb-2 text-[14px] font-normal text-gray-8">{ph("your_message")}</p>
                    <textarea className="text-[15px] outline-none resize-none font-normal placeholder:text-gray-8 text-gray-8 h-24 border-b border-gray-9 w-full"
                        placeholder={ph("type_your_message_here")}
                        value={message}
                        disabled={isBroadcastLoading}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                        onClick={() => setOpenBroadcast(false)}
                        disabled={isBroadcastLoading}
                        type="button"
                        className="h-[38px] cursor-pointer min-w-[83px] rounded-[8px] border border-green-2 px-5 text-[15px] font-normal text-green-2 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {ph("cancel")}
                    </button>
                    <button
                        type="button"
                        disabled={isBroadcastLoading}
                        onClick={handleSendMessage}
                        className="flex h-[38px] min-w-[114px] cursor-pointer items-center justify-center rounded-[8px] bg-green-1 px-5 text-[15px] font-normal text-white disabled:cursor-not-allowed disabled:opacity-80"
                    >
                        {isBroadcastLoading ? (
                            <span className="flex items-center gap-1">
                                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white [animation-delay:120ms]" />
                                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white [animation-delay:240ms]" />
                            </span>
                        ) : (
                            ph("send")
                        )}
                    </button>
                </div>
            </div >
        </div >
    );
}

export default BroadCastModal;