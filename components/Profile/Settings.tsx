"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { getCookie, setCookie } from "cookies-next";
import { useDictionary } from "@/dictionaries/DictionaryProvider";
import chevronIcon from "@/assets/icons/chevron.svg";
import chevronRight from "@/assets/icons/chevron-right-icon.svg";
import { i18n, type Locale } from "@/i18n.config";

function SettingsDivider() {
  return <div className="bg-gray-12 border-t border-gray-9 h-[27px]" />;
}

type SettingsRowProps = {
  label: string;
  value?: string;
  onClick?: () => void;
};

function SettingsRow({ label, value, onClick }: SettingsRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full cursor-pointer items-center justify-between px-4 py-4 text-left xl:px-6"
    >
      <span className="text-[15px] font-medium text-black-1">{label}</span>
      <div className="flex items-center gap-2 shrink-0">
        {value ? (
          <span className="text-[15px] font-normal text-gray-8">{value}</span>
        ) : null}
        <Image src={chevronRight} alt="" className="shrink-0" />
      </div>
    </button>
  );
}

function Settings() {
  const router = useRouter();
  const pathName = usePathname();
  const { pages, placeholders } = useDictionary();
  const [currentLocale, setCurrentLocale] = useState<Locale>(i18n.defaultLocale);

  const ph = (key: keyof typeof placeholders) => placeholders[key];

  useEffect(() => {
    const lang = getCookie("lang")?.toString();
    if (lang === "en" || lang === "ur") {
      setCurrentLocale(lang);
    }
  }, []);

  const languageLabel =
    currentLocale === "ur" ? ph("language_ur") : ph("language_en");

  const switchLocale = (locale: Locale) => {
    if (!pathName) return;
    setCookie("lang", locale);
    setCurrentLocale(locale);
    const segments = pathName.split("/");
    segments[1] = locale;
    router.push(segments.join("/"));
  };

  const handleChangePassword = () => {
    const locale = currentLocale || i18n.defaultLocale;
    router.push(`/${locale}/change-password`);
  };

  const handleLanguage = () => {
    const nextLocale: Locale = currentLocale === "en" ? "ur" : "en";
    switchLocale(nextLocale);
  };

  const handleDeleteAccount = () => {
    // Wire delete-account flow when API is available.
  };

  return (
    <div className="h-full bg-white">
      <div className="border-b border-gray-9 flex items-center justify-center px-4">
        <div className="h-[72px] w-full max-w-[522px] flex items-center gap-2 text-[14px]">
          <span className="text-gray-11">{pages.profile}</span>
          <Image src={chevronIcon} alt="" className="ltr:rotate-180" />
          <span className="text-green-2">{ph("settings")}</span>
        </div>
      </div>

      <div className="flex justify-center px-4">
        <div className="w-full max-w-[522px]">
          <SettingsRow
            label={ph("change_password")}
            onClick={handleChangePassword}
          />
          <SettingsDivider />
          <SettingsRow
            label={ph("language")}
            value={languageLabel}
            onClick={handleLanguage}
          />
          <SettingsDivider />
          <SettingsRow
            label={ph("delete_my_account")}
            onClick={handleDeleteAccount}
          />
        </div>
      </div>
    </div>
  );
}

export default Settings;
