"use client";

import { ArrowLeftIcon, CameraIcon, PaperAirplaneIcon, PlusIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { type ChatMessage, type ChatThread } from "./types";
import { useDictionary } from "@/dictionaries/DictionaryProvider";
import camIcon from "@/assets/icons/cam-icon.svg";
import SquareAddIcon from "@/assets/icons/add-square.svg";
import whiteArrowIcon from "@/assets/icons/white-arrow.svg";
type ChatWindowProps = {
  thread: ChatThread;
  messages: ChatMessage[];
  onBack?: () => void;
};

export default function ChatWindow({ thread, messages, onBack }: ChatWindowProps) {
  const { placeholders } = useDictionary();
  type PlaceholderKey = keyof typeof placeholders;
  const ph = (key: PlaceholderKey) => placeholders[key];

  return (
    <section className="flex h-full min-h-0 flex-1 flex-col">
      <header className="flex h-16 items-center gap-3 border-b border-gray-200 bg-white px-4 lg:px-8">
        {onBack ? (
          <button type="button" onClick={onBack} className="rounded-md p-1 text-gray-700 lg:hidden">
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
        ) : null}
        <Image
          src={thread.avatar}
          alt={thread.name}
          width={44}
          height={44}
          className="h-11 w-11 rounded-full object-cover"
          unoptimized
        />
        <div className="min-w-0">
          <p className="truncate text-[15px] font-semibold text-gray-900">{thread.name}</p>
          <p className="truncate text-xs text-gray-500">{thread.email}</p>
        </div>
      </header>

      <div className="flex-1 space-y-6 overflow-y-auto px-4 py-4 lg:px-8 lg:py-6">
        {messages.map((message) => (
          <div key={message.id}>
            {message.sentAtLabel ? <p className="mb-2 text-center text-xs text-gray-400">{message.sentAtLabel}</p> : null}
            <div className={`flex ${message.mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm leading-relaxed lg:max-w-[60%] ${message.mine ? "bg-[#EEF2F3] text-[#030303]" : "bg-[#F6F6F6] text-gray-900"}`}
              >
                {message.text}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-200 bg-white px-3 py-2.5 lg:px-7">
        <div className="flex items-center gap-2">
          <button type="button" className="rounded-md p-1 text-gray-500 cursor-pointer">
            <Image src={camIcon} alt="cam-icon" />
          </button>
          <button type="button" className="rounded-md p-1 text-gray-500 cursor-pointer">
            <Image src={SquareAddIcon} alt="square-add-icon" />
          </button>
          <div className="relative w-full">
            <input
              type="text"
              placeholder={ph("write_a_message")}
              className=" bg-[#EEF2F3] w-full pr-8 rtl:pl-8 rounded-[10px] flex-1 h-10 text px-4 text-[#949494] text-sm outline-none placeholder:text-[#949494]"
            />
            <Image src={whiteArrowIcon} alt="white-arrow-icon" className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer" />
          </div>
        </div>
      </div>
    </section>
  );
}
