"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useDictionary } from "@/dictionaries/DictionaryProvider";
import chevronIcon from "@/assets/icons/chevron.svg";
import noImageAvtar from "@/assets/images/no-image-av.png";
import { getUserId } from "@/utils/getUserId";
import { useGetUserFavouritesQuery } from "@/store/services/feedService";

type FavouriteItemDetails = {
  _id?: string;
  id?: string;
  title?: string;
  images?: string[];
  price?: number | string;
  ownerId?: { name?: string } | string;
  shopId?: { title?: string } | string;
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

function getFavouritePartyName(item: FavouriteItem): string {
  const details = item.itemDetails;
  if (!details) return "";
  if (item.itemType === "product" && details.shopId && typeof details.shopId === "object") {
    return details.shopId.title ?? "";
  }
  if (details.ownerId && typeof details.ownerId === "object") {
    return details.ownerId.name ?? "";
  }
  return "";
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

  const items = (
    (data as FavouritesResponse | undefined)?.data ?? []
  ).filter((item) => item.itemDetails);
  const loading = isLoading || isFetching;

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
                const template =
                  item.itemType === "service" ? ph("liked_service_of") : ph("liked_product_of");
                const favouriteText = template
                  .replace("{title}", details.title ?? "")
                  .replace("{name}", getFavouritePartyName(item));
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
                        <h3 className="truncate text-[15px] font-medium text-black-1">
                          {favouriteText}
                        </h3>
                      </div>
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
