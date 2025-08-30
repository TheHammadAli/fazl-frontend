import { useDictionary } from "@/dictionaries/DictionaryProvider";
import React, { useState } from "react";
import Image from "next/image";
import crossImage from "@/assets/icons/cross-icon.svg";

function ChooseImagesTab() {
  const { pages, placeholders } = useDictionary();
  const [files, setFiles] = useState<File[]>([]);
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);

    setFiles((prev) => [...prev, ...selectedFiles].slice(0, 5));
  };
  const removeImage = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };
  return (
    <div>
      <div className="mt-5 flex gap-2 flex-wrap">
        {files.map((file, index) => (
          <div
            key={index}
            className="relative h-[126px] w-[126px] rounded-[12px] overflow-hidden"
          >
            <Image
              src={URL.createObjectURL(file)}
              alt={`upload-${index}`}
              fill
              className="object-cover  h-full w-full"
            />
            <div
              className="absolute  h-[24px]  rounded-full ltr:right-2 rtl:left-2 top-2 w-[24px] bg-opacity-50 flex items-center justify-center cursor-pointer"
              onClick={() => removeImage(index)}
              data-testid="remove-image"
            >
              <div className="h-full w-full rounded-full flex items-center justify-center relative  overflow-hidden">
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
        ))}
        {files.length < 5 && (
          <div className="h-[126px] min-w-[126px]  flex items-center justify-center ">
            <label
              htmlFor="photo-upload"
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

              {files.length == 0 && (
                <h1 className="font-medium text-green-1 text-[16px]">
                  {placeholders.upload_photos}
                </h1>
              )}
              <input
                id="photo-upload"
                type="file"
                multiple
                accept="image/*"
                onChange={handleUpload}
                className="hidden"
              />
            </label>
          </div>
        )}
      </div>
      <div className="w-full flex mt-4 items-center justify-center text-[14px] font-normal text-green-2">
        {files.length}/5
      </div>
    </div>
  );
}

export default ChooseImagesTab;
