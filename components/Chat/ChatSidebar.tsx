"use client";

import Image from "next/image";
import { useDictionary } from "@/dictionaries/DictionaryProvider";
import { type ChatThread } from "./types";
import { useGetAllConversationsForUserQuery } from "@/store/services/chatService";
import { getUserId } from "@/utils/getUserId";

type ChatSidebarProps = {
  threads: ChatThread[];
  activeThreadId: string;
  onSelectThread: (threadId: string) => void;
  threadType: string;
  setThreadType: (threadType: string) => void;
};

export default function ChatSidebar({
  threadType,
  setThreadType,
  threads,
  activeThreadId,
  onSelectThread,
}: ChatSidebarProps) {
  const { placeholders } = useDictionary();
  type PlaceholderKey = keyof typeof placeholders;
  const ph = (key: PlaceholderKey) => placeholders[key];
  const userId = getUserId() ?? "";
  const { data: conversations } = useGetAllConversationsForUserQuery({
    id: userId,
    page: 1,
    limit: 10,
  },
    {
      skip: !userId,
    },
  );
  console.log(conversations, "conversations");
  return (
    <aside className="h-full w-full border-r border-gray-200 bg-white lg:w-[320px]" >
      <div className="flex h-16 items-center border-b border-gray-200 px-4">
        <h1 className="text-[22px] font-medium text-[#030303]">{ph("chat_title")}</h1>
      </div>
      <div className="flex text-sm">
        <button type="button" onClick={() => setThreadType("direct_messages")} className={`w-1/2 cursor-pointer py-2.5 ${threadType === "direct_messages" ? "border-b-2 border-[#3C9197] font-medium text-[#007781]" : "border-b border-[#E5E5E5] font-normal text-[#4B514F]"}`}>
          {ph("direct_messages")}
        </button>
        <button type="button" onClick={() => setThreadType("broadcast_messages")} className={`w-1/2 cursor-pointer py-2.5 ${threadType === "broadcast_messages" ? "border-b-2 border-[#3C9197] font-medium text-[#007781]" : "border-b border-[#E5E5E5] font-normal text-[#4B514F]"}`}>
          {ph("broadcast_messages")}
        </button>
      </div>
      <ul className="h-[calc(100%-104px)] overflow-y-auto">
        {threads.map((thread) => {
          const isActive = thread.id === activeThreadId;
          return (
            <li key={thread.id}>
              <button
                type="button"
                onClick={() => onSelectThread(thread.id)}
                className={`flex cursor-pointer w-full items-start gap-3 px-4 py-4 text-left ${isActive ? "bg-[#E7F4F5]" : "hover:bg-gray-50"}`}
              >
                <Image
                  src={thread.avatar}
                  alt={thread.name}
                  width={44}
                  height={44}
                  className="h-11 w-11 rounded-full object-cover"
                  unoptimized
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-[15px] font-medium text-[#030303]">{thread.name}</p>
                    <span className="shrink-0 text-[13px] font-normal text-[#4B514F]">{thread.timeLabel}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <p className="truncate text-sm text-gray-600">{thread.preview}</p>
                    {thread.unread ? <span className="h-2 w-2 shrink-0 rounded-full bg-[#3C9197]" /> : null}
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </aside >
  );
}
