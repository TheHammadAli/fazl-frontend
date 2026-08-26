"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { BeatLoader } from "react-spinners";
import { useDictionary } from "@/dictionaries/DictionaryProvider";
import chevronIcon from "@/assets/icons/chevron.svg";
import crossIcon from "@/assets/icons/cross-icon.svg";
import noImageAvtar from "@/assets/images/no-image-av.png";
import { getUserId } from "@/utils/getUserId";
import {
  useGetUserFavouritesQuery,
  useUnlikeVideoMutation,
} from "@/store/services/feedService";

type FavouriteItemDetails = {
  _id?: string;
  id?: string;
  title?: string;
  images?: string[];
  price?: number | string;
};

type FavouriteItem = {
  itemId?: string;
  itemType?: "product" | "service";
  itemDetails?: FavouriteItemDetails;
};

type FavouritesResponse = {
  data?: FavouriteItem[];
};

function getFavouriteKey(item: FavouriteItem, index: number): string {
  return item.itemDetails?._id ?? item.itemDetails?.id ?? item.itemId ?? String(index);
}

function Favourites() {
  const { placeholders } = useDictionary();
  type PlaceholderKey = keyof typeof placeholders;
  const ph = (key: PlaceholderKey) => placeholders[key];
  const router = useRouter();
  const userId = getUserId() ?? "";

  const { data, isLoading, isFetching } = useGetUserFavouritesQuery(userId, {
    skip: !userId,
  });
  const [unlikeVideo] = useUnlikeVideoMutation();
  const [removingId, setRemovingId] = useState("");

  const items = (
    (data as FavouritesResponse | undefined)?.data ?? []
  ).filter((item) => item.itemDetails);
  const loading = isLoading || isFetching;

  async function handleRemove(item: FavouriteItem) {
    if (!item.itemId || !item.itemType || removingId) return;
    setRemovingId(item.itemId);
    try {
      await unlikeVideo({ itemId: item.itemId, itemType: item.itemType }).unwrap();
    } catch {
      // Cache stays consistent either way — a stale row is the worst case.
    } finally {
      setRemovingId("");
    }
  }

  function handleOpen(item: FavouriteItem) {
    if (!item.itemId) return;
    router.push(
      item.itemType === "service"
        ? `/book-service?id=${item.itemId}`
        : `/buy-product?id=${item.itemId}`,
    );
  }

  return (
    <div className="h-full">
      <div className="border-b px-4 border-gray-9 flex items-center justify-center">
        <div className="h-[72px] w-[522px] flex items-center gap-2 text-[14px]">
          <span className="text-gray-11">{ph("profile")}</span>
          <Image src={chevronIcon} alt="chevron" className="ltr:rotate-180" />
          <span className="text-green-2">{ph("favourites")}</span>
        </div>
      </div>

      <div className="flex justify-center px-4">
        <div className="w-[522px] pt-5">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[76px] w-full animate-pulse rounded-[8px] bg-gray-200"
                />
              ))}
            </div>
          ) : items.length === 0 ? (
            <p className="py-8 text-center text-[15px] font-medium text-gray-8">
              {ph("no_favourites_yet")}
            </p>
          ) : (
            <div className="max-w-[760px] bg-white">
              {items.map((item, index) => {
                const details = item.itemDetails as FavouriteItemDetails;
                const isRemoving = removingId === item.itemId;
                return (
                  <div
                    key={getFavouriteKey(item, index)}
                    className="flex items-center justify-between gap-3 py-4 border-b border-gray-9"
                  >
                    <button
                      type="button"
                      onClick={() => handleOpen(item)}
                      className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-left"
                    >
                      <Image
                        src={details.images?.[0] || noImageAvtar}
                        alt={details.title ?? ""}
                        width={60}
                        height={60}
                        className="h-[60px] w-[60px] shrink-0 rounded-[8px] bg-gray-5 object-cover"
                        unoptimized
                      />
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-[15px] font-medium leading-none text-black-1">
                          {details.title}
                        </h3>
                        {details.price ? (
                          <p className="mt-1 text-[14px] font-medium leading-none text-green-1">
                            Rs {details.price}
                          </p>
                        ) : null}
                      </div>
                    </button>
                    <button
                      type="button"
                      aria-label={ph("remove_from_favourites")}
                      onClick={() => handleRemove(item)}
                      disabled={isRemoving}
                      className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full hover:bg-gray-9 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isRemoving ? (
                        <BeatLoader color="#E92440" size={6} />
                      ) : (
                        <Image src={crossIcon} alt="" width={12} height={12} />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Favourites;
