import { useDictionary } from "@/dictionaries/DictionaryProvider";
import React from "react";
import Image from "next/image";
import crossIcon from "@/assets/icons/cross-icon.svg";
import { useCategoriesQuery } from "@/custom-hooks/useCategoriesQuery";
import chevron from "@/assets/icons/chev-down-icon.svg";
import CategoriesSkeleton from "./CategoriesSkeleton";
import { getFeedCategoryLabel } from "@/utils/getFeedCategoryLabel";

export type CategoryParameterEntry = {
  name: string;
  values: string[];
};

export type CategoryParameters = {
  en: CategoryParameterEntry[];
  ur: CategoryParameterEntry[];
};

export interface categroyTypes {
  _id: string;
  name: string | { en: string; ur: string };
  type?: string;
  parameters?: CategoryParameters;
}

interface CategoryModalRef {
  setIsCatOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedCategory: categroyTypes | null;
  setSelectedCategory: React.Dispatch<
    React.SetStateAction<categroyTypes | null>
  >;
  type?: string;
}

export function getCategoryParameterEntries(
  parameters: CategoryParameters | undefined,
  lang: string,
): CategoryParameterEntry[] {
  if (!parameters) return [];

  const entries =
    ((lang === "ur" ? parameters.ur : parameters.en) ??
      parameters.en ??
      parameters.ur ??
      []) as Array<CategoryParameterEntry | string>;

  return entries
    .map((entry) => {
      if (typeof entry === "string") {
        const name = entry.trim();
        return name ? { name, values: [] as string[] } : null;
      }

      const name = entry?.name?.trim() ?? "";
      if (!name) return null;

      const values = Array.isArray(entry?.values)
        ? entry.values.map((value) => String(value).trim()).filter(Boolean)
        : [];

      return { name, values };
    })
    .filter((entry): entry is CategoryParameterEntry => entry != null);
}

export function mapCategoryParametersToListingParameters(
  parameters: CategoryParameters | undefined,
  lang: string,
): { name: string; variants: string[]; options: string[]; isCustom: false }[] {
  return getCategoryParameterEntries(parameters, lang).map((entry) => ({
    name: entry.name,
    variants: [],
    options: [...entry.values],
    isCustom: false,
  }));
}

/** Keep API listing params; attach category options so mapped params use the list modal. */
export function hydrateListingParametersFromApi(
  apiParameters:
    | Array<{ name?: string; variants?: string[] }>
    | undefined,
  category: categroyTypes | null | undefined,
  lang: string,
): {
  name: string;
  variants: string[];
  options?: string[];
  isCustom: boolean;
}[] {
  const api = (apiParameters ?? [])
    .map((p) => ({
      name: (p.name ?? "").trim(),
      variants: Array.isArray(p.variants)
        ? p.variants.map((v) => String(v).trim()).filter(Boolean)
        : [],
    }))
    .filter((p) => p.name !== "");

  if (api.length === 0) return [];

  const enEntries = mapCategoryParametersToListingParameters(
    category?.parameters,
    "en",
  );
  const urEntries = mapCategoryParametersToListingParameters(
    category?.parameters,
    "ur",
  );
  const preferredEntries =
    lang === "ur"
      ? urEntries.length > 0
        ? urEntries
        : enEntries
      : enEntries.length > 0
        ? enEntries
        : urEntries;

  const categoryByName = new Map<string, (typeof preferredEntries)[number]>();
  const pairCount = Math.max(enEntries.length, urEntries.length);
  for (let i = 0; i < pairCount; i++) {
    const preferred = preferredEntries[i] ?? enEntries[i] ?? urEntries[i];
    if (!preferred) continue;
    const enName = enEntries[i]?.name?.trim().toLowerCase();
    const urName = urEntries[i]?.name?.trim().toLowerCase();
    if (enName) categoryByName.set(enName, preferred);
    if (urName) categoryByName.set(urName, preferred);
  }

  return api.map((p) => {
    const match = categoryByName.get(p.name.toLowerCase());
    // Listing params allow a single selected value
    const selected = p.variants.slice(0, 1);
    if (match) {
      const options = [...(match.options ?? [])];
      const otherValue =
        selected[0] && !options.includes(selected[0])
          ? selected[0]
          : undefined;
      return {
        name: match.name || p.name,
        variants: selected,
        options,
        ...(otherValue ? { otherValue } : {}),
        isCustom: false,
      };
    }

    return {
      name: p.name,
      variants: selected,
      options: [],
      ...(selected[0] ? { otherValue: selected[0] } : {}),
      isCustom: false,
    };
  });
}

function CategoryModal({
  setIsCatOpen,
  selectedCategory,
  setSelectedCategory,
  type,
}: CategoryModalRef) {
  const { placeholders, error_messages, currentLanguage } = useDictionary();
  const {
    data: categories,
    isLoading: isCategoriesLoading,
    isFetching: isCategoriesFetching,
  } = useCategoriesQuery({
    ...(type ? { type: type, lang: currentLanguage } : {}),
  });

  return (
    <div className="h-[470px] w-[456px] overflow-scroll rounded-[10px] bg-[white] hide-scrollbar">
      <div className="sticky top-0 z-50 flex items-center justify-between border-b-[1px] border-gray-9 bg-white px-[15px] py-[16px]">
        <h1 className="text-[16px] font-medium leading-none text-black-3">
          {selectedCategory
            ? getFeedCategoryLabel(selectedCategory.name, currentLanguage)
            : placeholders.choose_category}
        </h1>
        <Image
          src={crossIcon}
          className="w-3 cursor-pointer"
          alt="cross-icon"
          onClick={() => setIsCatOpen(false)}
        />
      </div>
      <div className="z-20 w-full">
        {isCategoriesLoading || isCategoriesFetching ? (
          <CategoriesSkeleton />
        ) : categories?.data?.length > 0 ? (
          <>
            {categories?.data?.map((category: categroyTypes, index: number) => (
              <div
                onClick={() => {
                  setSelectedCategory(category);
                  setIsCatOpen(false);
                }}
                key={category._id || index}
                className="flex cursor-pointer items-center justify-between border-b-[1px] border-gray-9 px-[15px] py-[16px]"
              >
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="#007781"
                    className="h-[24px] w-[24px]"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 0 0 2.25-2.25V6a2.25 2.25 0 0 0-2.25-2.25H6A2.25 2.25 0 0 0 3.75 6v2.25A2.25 2.25 0 0 0 6 10.5Zm0 9.75h2.25A2.25 2.25 0 0 0 10.5 18v-2.25a2.25 2.25 0 0 0-2.25-2.25H6a2.25 2.25 0 0 0-2.25 2.25V18A2.25 2.25 0 0 0 6 20.25Zm9.75-9.75H18a2.25 2.25 0 0 0 2.25-2.25V6A2.25 2.25 0 0 0 18 3.75h-2.25A2.25 2.25 0 0 0 13.5 6v2.25a2.25 2.25 0 0 0 2.25 2.25Z"
                    />
                  </svg>
                  <h2 className="text-[15px] font-medium text-black-1">
                    {getFeedCategoryLabel(category?.name, currentLanguage)}
                  </h2>
                </div>
                <Image
                  src={chevron}
                  alt="chevron"
                  className="-rotate-90 rtl:rotate-90"
                />
              </div>
            ))}
          </>
        ) : (
          <div className="flex h-[410px] w-full items-center justify-center">
            <h1 className="text-[16px] font-medium text-black-3">
              {error_messages.no_categories}
            </h1>
          </div>
        )}
      </div>
    </div>
  );
}

export default CategoryModal;
