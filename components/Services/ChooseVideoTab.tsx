"use client";

import { useDictionary } from "@/dictionaries/DictionaryProvider";
import React, { useState } from "react";
import Image from "next/image";
import crossImage from "@/assets/icons/cross-icon.svg";
interface Props {
  video: File | null | string;
  setVideo: React.Dispatch<React.SetStateAction<File | null | string>>;
}
function ChooseVideoTab({ video, setVideo }: Props) {
  const { pages, placeholders } = useDictionary();

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const selectedFile = e.target.files[0];
    setVideo(selectedFile);
  };

  const removeVideo = () => {
    setVideo(null);
  };

  return (
    <div>
      <div className="mt-5 flex gap-2 flex-wrap">
        {/* Video Preview */}
        {video && (
          <div className="relative h-[126px] w-[126px] rounded-[12px] overflow-hidden">
            <video
              src={
                typeof video === "string" ? video : URL.createObjectURL(video)
              }
              className="object-cover h-full w-full"
              controls
            />
            <div
              className="absolute h-[24px] w-[24px] right-2 top-2 bg-opacity-50 flex items-center justify-center cursor-pointer"
              onClick={removeVideo}
              data-testid="remove-video"
            >
              <div className="h-full w-full rounded-full flex items-center justify-center relative overflow-hidden">
                <div className="h-full w-full absolute bg-white opacity-80 overflow-hidden"></div>
                <div className="relative">
                  <Image
                    src={crossImage}
                    alt="cross-icon"
                    className="overflow-hidden"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Upload Button */}
        {!video && (
          <div className="h-[126px] min-w-[126px] flex items-center justify-center">
            <label
              htmlFor="video-upload"
              className="h-[46px] border-green-1 border-[1px] px-3 rounded-[12px] flex items-center justify-center gap-1 cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="#007781"
                className="size-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>

              <h1 className="font-medium text-green-1 text-[16px]">
                {placeholders.upload_video}
              </h1>
              <input
                id="video-upload"
                type="file"
                accept="video/*"
                onChange={handleUpload}
                className="hidden"
              />
            </label>
          </div>
        )}
      </div>

      {/* Counter */}
      <div className="w-full flex mt-4 items-center justify-center text-[14px] font-normal text-green-2">
        {video ? "1/1" : "0/1"}
      </div>
    </div>
  );
}

export default ChooseVideoTab;
