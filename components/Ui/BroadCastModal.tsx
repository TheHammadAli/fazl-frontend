import React, { useRef, useState } from "react";
import chevDown from "@/assets/icons/chev-down-icon.svg";
import crossIcon from "@/assets/icons/cross-icon.svg";
import locationIcon from "@/assets/icons/location-icon.svg";
import Image from "next/image";
import { useGetAllCategoriesQuery } from "@/store/services/sellingService";
import { useGetLocationsQuery } from "@/store/services/authService";
import { toast } from "react-hot-toast";
import { useBroadcastMessageMutation } from "@/store/services/chatService";
import { useDictionary } from "@/dictionaries/DictionaryProvider";
import ChooseImagesTab from "@/components/Services/ChooseImagesTab";
import { useClickOutside } from "@/custom-hooks/useClickOutside";
import { useDebounce } from "use-debounce";

type CategoryItem = {
    _id: string;
    name: string;
};
type BroadcastType = "product" | "service";
type BroadcastPurpose = "buying" | "selling";

type Location = {
    description?: string;
    type?: string;
    coordinates?: {
        lat?: number;
        lng?: number;
    };
};

function toPointLocation(location: Location) {
    const lat = location.coordinates?.lat;
    const lng = location.coordinates?.lng;
    if (lat == null || lng == null) return null;
    return {
        type: "Point" as const,
        coordinates: [lat, lng] as [number, number],
    };
}

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
    const [isPurposeOpen, setIsPurposeOpen] = useState(false);
    const [selectedPurpose, setSelectedPurpose] = useState<BroadcastPurpose | null>(null);
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<CategoryItem | null>(null);
    const locationRef = useRef<HTMLDivElement | null>(null);
    const [isLocationOpen, setIsLocationOpen] = useState(false);
    const [location, setLocation] = useState<Location>({});
    const [locationSearch, setLocationSearch] = useState("");
    const [debouncedLocationSearch] = useDebounce(locationSearch, 500);
    const { data: categories, isLoading: isCategoriesLoading, isFetching: isCategoriesFetching } = useGetAllCategoriesQuery("");
    const {
        data: locationsData,
        isLoading: isLocationsLoading,
        isFetching: isLocationsFetching,
    } = useGetLocationsQuery(
        { q: debouncedLocationSearch },
        { skip: locationSearch?.trim() === "" },
    );
    const [message, setMessage] = useState("");
    const [images, setImages] = useState<(File | string)[]>([]);
    const [broadcastMessage, { isLoading: isBroadcastLoading }] = useBroadcastMessageMutation();

    useClickOutside(locationRef, () => {
        setIsLocationOpen(false);
    });

    const handleSendMessage = async () => {
        if (selectedRadius === null) {
            toast.error(eh("radius_required"));
            return;
        }
        const pointLocation = toPointLocation(location);
        if (!pointLocation) {
            toast.error(eh("location_required"));
            return;
        }
        if (selectedType === null) {
            toast.error(eh("type_required"));
            return;
        }
        if (selectedPurpose === null) {
            toast.error(eh("purpose_required"));
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

        const imageFiles = images.filter((img): img is File => img instanceof File);

        const payload =
            imageFiles.length > 0
                ? (() => {
                    const fd = new FormData();
                    fd.append("type", selectedType);
                    fd.append("purpose", selectedPurpose);
                    fd.append("message", message.trim());
                    fd.append("radius", String(selectedRadius));
                    fd.append("categoryId", selectedCategory._id);
                    fd.append("location", JSON.stringify(pointLocation));
                    imageFiles.forEach((file) => fd.append("files", file));
                    return fd;
                })()
                : {
                    type: selectedType,
                    purpose: selectedPurpose,
                    message: message.trim(),
                    radius: selectedRadius,
                    categoryId: selectedCategory._id,
                    location: pointLocation,
                };

        try {
            const res = await broadcastMessage(payload).unwrap();
            toast.success(res.message, { duration: SUCCESS_TOAST_DURATION });
            setImages([]);
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

            <div className={`space-y-2 px-5 py-3 ${isBroadcastLoading ? "pointer-events-none opacity-70" : ""}`}>
                <div className="relative border-b border-gray-9 pb-2">
                    <p className="mb-1 text-[14px] font-normal text-gray-8">{ph("set_radius")}</p>
                    <button
                        disabled={isBroadcastLoading}
                        type="button"
                        onClick={() => {
                            setIsRadiusOpen((prev) => !prev);
                            setIsTypeOpen(false);
                            setIsPurposeOpen(false);
                            setIsCategoryOpen(false);
                            setIsLocationOpen(false);
                        }}
                        className="flex w-full cursor-pointer items-center justify-between text-left disabled:cursor-not-allowed"
                    >
                        <span className="text-[15px] font-normal text-gray-8">
                            {selectedRadius != null ? `${selectedRadius} ${placeholders["km" as keyof typeof placeholders] ?? "km"}` : ph("choose_radius")}
                        </span>
                        <Image src={chevDown} alt="cross-icon" className="cursor-pointer" />
                    </button>
                    {isRadiusOpen ? (
                        <div className="absolute left-0 right-0 top-[62px] z-20 max-h-[200px] overflow-y-auto rounded-[8px] border border-gray-9 bg-white shadow-md">
                            {Array.from({ length: 100 }, (_, idx) => idx + 1).map((radius) => (
                                <button
                                    key={radius}
                                    type="button"
                                    className="w-full cursor-pointer border-b border-gray-9 rtl:text-right ltr:text-left px-3 py-2 text-left text-[14px] text-black-1 last:border-b-0 hover:bg-gray-10"
                                    onClick={() => {
                                        setSelectedRadius(radius);
                                        setIsRadiusOpen(false);
                                    }}
                                >
                                    {radius} {placeholders["km" as keyof typeof placeholders] ?? "km"}
                                </button>
                            ))}
                        </div>
                    ) : null}
                </div>

                <div className="relative border-b border-gray-9 pb-2">
                    <p className="mb-1 text-[14px] font-normal text-gray-8">
                        {ph("location")}
                    </p>
                    <div ref={locationRef}>
                        <button
                            disabled={isBroadcastLoading}
                            type="button"
                            onClick={() => {
                                setIsLocationOpen((prev) => !prev);
                                setIsRadiusOpen(false);
                                setIsTypeOpen(false);
                                setIsPurposeOpen(false);
                                setIsCategoryOpen(false);
                            }}
                            className="flex w-full cursor-pointer items-center justify-between text-left disabled:cursor-not-allowed"
                        >
                            <span className="text-[15px] font-normal text-gray-8">
                                {location?.description ?? ph("choose_location")}
                            </span>
                            <Image src={chevDown} alt="chev-down" />
                        </button>
                        {isLocationOpen ? (
                            <div className="absolute left-0 right-0 top-[62px] z-20 rounded-[8px] border border-gray-9 bg-white pt-1 shadow-md">
                                <input
                                    type="text"
                                    placeholder={ph("search_country")}
                                    className="w-full rounded-t-[8px] border-b border-gray-9 px-3 py-2 text-[14px] outline-none"
                                    value={locationSearch}
                                    onChange={(e) => setLocationSearch(e.target.value)}
                                />
                                <div className="max-h-[200px] overflow-y-auto">
                                    {!isLocationsLoading &&
                                        !isLocationsFetching &&
                                        (locationsData?.data?.length ?? 0) > 0 &&
                                        locationsData?.data?.map((item: Location, index: number) => (
                                            <button
                                                key={`${item.description}-${index}`}
                                                type="button"
                                                onClick={() => {
                                                    setLocation(item);
                                                    setIsLocationOpen(false);
                                                    setLocationSearch("");
                                                }}
                                                className="flex w-full cursor-pointer items-center gap-2 border-b border-gray-9 px-3 py-2 text-left text-[14px] text-black-1 last:border-b-0 hover:bg-gray-10"
                                            >
                                                <Image
                                                    src={locationIcon}
                                                    alt=""
                                                    className="h-[18px] w-[14px] shrink-0"
                                                />
                                                <span>{item.description}</span>
                                            </button>
                                        ))}
                                    {!isLocationsLoading &&
                                        !isLocationsFetching &&
                                        locationsData?.data?.length === 0 && (
                                            <p className="px-3 py-2 text-[14px] text-gray-8">
                                                {ph("no_data_available")}
                                            </p>
                                        )}
                                    {(isLocationsLoading || isLocationsFetching) && (
                                        <div className="space-y-1 p-1">
                                            {Array.from({ length: 4 }).map((_, index) => (
                                                <div
                                                    key={index}
                                                    className="h-[36px] animate-pulse rounded bg-gray-10"
                                                />
                                            ))}
                                        </div>
                                    )}
                                    {!locationsData &&
                                        !isLocationsLoading &&
                                        !isLocationsFetching && (
                                            <p className="px-3 py-2 text-[14px] text-gray-8">
                                                {ph("no_data_available")}
                                            </p>
                                        )}
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>

                <div className="relative border-b border-gray-9 pb-2">
                    <p className="mb-1 text-[14px] font-normal text-gray-8">{ph("type")}</p>
                    <button
                        disabled={isBroadcastLoading}
                        type="button"
                        onClick={() => {
                            setIsTypeOpen((prev) => !prev);
                            setIsRadiusOpen(false);
                            setIsPurposeOpen(false);
                            setIsCategoryOpen(false);
                            setIsLocationOpen(false);
                        }}
                        className="flex w-full cursor-pointer items-center justify-between text-left disabled:cursor-not-allowed"
                    >
                        <span className="text-[15px] first-letter:capitalize font-normal text-gray-8">
                            {selectedType ? placeholders[selectedType as keyof typeof placeholders] ?? selectedType : ph("choose_type")}
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
                                    <p className="first-letter:uppercase rtl:text-right ltr:text-left">{type.label}</p>
                                </button>
                            ))}
                        </div>
                    ) : null}
                </div>

                <div className="relative border-b border-gray-9 pb-2">
                    <p className="mb-1 text-[14px] font-normal text-gray-8">{ph("purpose")}</p>
                    <button
                        disabled={isBroadcastLoading}
                        type="button"
                        onClick={() => {
                            setIsPurposeOpen((prev) => !prev);
                            setIsRadiusOpen(false);
                            setIsTypeOpen(false);
                            setIsCategoryOpen(false);
                            setIsLocationOpen(false);
                        }}
                        className="flex w-full cursor-pointer items-center justify-between text-left disabled:cursor-not-allowed"
                    >
                        <span className="text-[15px] first-letter:capitalize font-normal text-gray-8">
                            {selectedPurpose
                                ? ph(selectedPurpose.toLocaleLowerCase() as keyof typeof placeholders)
                                : ph("choose_purpose")}
                        </span>
                        <Image src={chevDown} alt="chev-down" />
                    </button>
                    {isPurposeOpen ? (
                        <div className="absolute left-0 right-0 top-[62px] z-20 max-h-[200px] overflow-y-auto rounded-[8px] border border-gray-9 bg-white shadow-md">
                            {([
                                { value: "Buying", label: ph("buying") },
                                { value: "Selling", label: ph("selling") },
                            ] as any).map((purpose) => (
                                <button
                                    key={purpose.value}
                                    type="button"
                                    className="w-full cursor-pointer border-b border-gray-9 px-3 py-2 text-left text-[14px] text-black-1 last:border-b-0 hover:bg-gray-10"
                                    onClick={() => {
                                        setSelectedPurpose(purpose.value);
                                        setIsPurposeOpen(false);
                                    }}
                                >
                                    <p className="first-letter:uppercase rtl:text-right ltr:text-left">{purpose.label}</p>
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
                            setIsPurposeOpen(false);
                            setIsLocationOpen(false);
                        }}
                        className="flex cursor-pointer w-full items-center justify-between text-left disabled:cursor-not-allowed"
                    >
                        <span className="text-[15px] font-normal text-gray-8">
                            {selectedCategory?.name ?? ph("choose_category")}
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
                    <textarea className="text-[15px] outline-none resize-none font-normal placeholder:text-gray-8 text-gray-8 h-20 border-b border-gray-9 w-full"
                        placeholder={ph("type_your_message_here")}
                        value={message}
                        disabled={isBroadcastLoading}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                </div>

                <div className="border-b border-gray-9 pb-4">
                    <p className="mb-2 text-[14px] font-normal text-gray-8">
                        {ph("broadcast_photos_optional" as PlaceholderKey)}
                    </p>
                    <div className="-mt-2 ">
                        <ChooseImagesTab
                            images={images}
                            setImages={setImages}
                            inputId="broadcast-modal-photo-upload"
                        />
                    </div>

                </div>

                <div className="flex items-center pb-1 justify-end gap-3 pt-2">
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

            </div>

        </div>
    );
}

export default BroadCastModal;