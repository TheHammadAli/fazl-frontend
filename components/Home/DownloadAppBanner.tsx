"use client";

import Image from "next/image";
import MobileTabsImage from "@/assets/icons/mobile-tabs.svg";
import GoogleStoreBadge from "@/assets/icons/google-store.svg";
import AppleStoreBadge from "@/assets/icons/apple-store.svg";
import { useDictionary } from "@/dictionaries/DictionaryProvider";

function DownloadAppBanner() {
    const { info_messages } = useDictionary();

    return (
        <section className="mt-8 overflow-hidden rounded-[16px] bg-green-1 sm:mt-14 sm:rounded-[24px]">
            <div className="flex flex-col items-center  sm:flex-row px-5 gap-5  md:px-10 md:gap-8  xl:px-16 xl:gap-16  pt-5 md:pb-0 pb-5">
                <div className="relative h-[150px] w-full max-w-[280px] shrink-0 sm:h-[190px] sm:max-w-[320px] md:h-[220px] md:max-w-[300px] lg:h-[240px] xl:max-w-[405px]">
                    <Image
                        src={MobileTabsImage}
                        alt=""
                        fill
                        unoptimized
                        className="object-contain object-center"
                    />
                </div>

                <div className="min-w-0 w-full text-center sm:max-w-[52%] sm:text-left rtl:sm:text-right">
                    <h2 className="text-[18px] sm:text-[20px] font-medium leading-tight text-white  md:text-[24px] xl:text-[26px]">
                        {info_messages.buy_sell_connect_on_the_go}
                    </h2>
                    <p className="mt-2 text-[18px] sm:text-[20px] font-medium text-white  md:text-[22px] xl:text-[26px]">
                        {info_messages.download_our_app_now}
                    </p>

                    <div className="mt-5 flex flex-wrap items-center justify-center gap-3 sm:justify-start rtl:sm:justify-end">
                        <a
                            href="#"
                            aria-label={info_messages.download_on_google_play}
                            className="inline-flex shrink-0"
                        >
                            <Image
                                src={GoogleStoreBadge}
                                alt={info_messages.download_on_google_play}
                                className="lg:h-[54px] h-[42px] xl:w-[182px] w-[140px]"
                                unoptimized
                            />
                        </a>
                        <a
                            href="#"
                            aria-label={info_messages.download_on_app_store}
                            className="inline-flex shrink-0"
                        >
                            <Image
                                src={AppleStoreBadge}
                                alt={info_messages.download_on_app_store}
                                className="h-[54px] xl:w-[182px] w-[140px]"
                                unoptimized
                            />
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default DownloadAppBanner;
