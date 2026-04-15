"use client";

import Image from "next/image";
import { useDictionary } from "@/dictionaries/DictionaryProvider";
import { type ChatThread } from "./types";
import { useGetAllConversationsForUserQuery } from "@/store/services/chatService";
import { getUserId } from "@/utils/getUserId";
import { useEffect, useState } from "react";
import moment from "moment";
import { parsePositiveInt } from "../Updates/Notifications";


type ChatSidebarProps = {
  onSelectChat: (thread: ChatThread) => void;
  threadType: string;
  setThreadType: (threadType: string) => void;
  chatId: string;
};

export default function ChatSidebar({
  threadType,
  setThreadType,
  chatId,
  onSelectChat,
}: ChatSidebarProps) {
  const { currentLanguage } = useDictionary();
  const PAGE_LIMIT = 15;
  const [page, setPage] = useState(1);
  const [isMounted, setIsMounted] = useState(false);
  const { placeholders } = useDictionary();
  type PlaceholderKey = keyof typeof placeholders;
  const ph = (key: PlaceholderKey) => placeholders[key];
  const [filteredThreads, setFilteredThreads] = useState<ChatThread[]>([]);
  const userId = getUserId() ?? "";
  const { data: conversations, isFetching, isLoading } = useGetAllConversationsForUserQuery({
    id: userId,
    page,
    limit: PAGE_LIMIT,
  },
    {
      skip: !userId,
    },
  );
  const totalPages = parsePositiveInt(conversations?.data?.totalPages);
  const lastBatch =
    (conversations?.data?.conversations as ChatThread[] | undefined) ?? [];
  const canLoadMore =
    totalPages != null ? page < totalPages : lastBatch.length >= PAGE_LIMIT;

  function handleScrollNearBottom(e: React.UIEvent<HTMLUListElement>) {
    if (!userId || isFetching || !canLoadMore) return;
    const el = e.currentTarget;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight <= 80;
    if (!nearBottom) return;
    setPage((p) => p + 1);
  }
  useEffect(() => {
    setIsMounted(true);
  }, []);
  useEffect(() => {
    const firstConversation = conversations?.data?.[0] as ChatThread | undefined;
    if (!chatId && firstConversation) {
      onSelectChat(firstConversation);
    }
    if (page === 1) {
      setFilteredThreads(conversations?.data ?? []);
    } else {
      setFilteredThreads((prev) => [...prev, ...conversations?.data]);
    }
  }, [chatId, conversations?.data, onSelectChat, page]);
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
      <ul onScroll={handleScrollNearBottom} className="h-[calc(100%-104px)] overflow-y-auto">
        {isMounted && isLoading && page === 1
          ? Array.from({ length: 6 }).map((_, index) => (
            <li key={index} className="px-4 py-4">
              <div className="flex animate-pulse items-start gap-3">
                <div className="h-11 w-11 rounded-full bg-gray-200" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="h-4 w-32 rounded bg-gray-200" />
                    <div className="h-3 w-10 rounded bg-gray-200" />
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <div className="h-3 w-44 rounded bg-gray-200" />
                    <div className="h-2 w-2 rounded-full bg-gray-200" />
                  </div>
                </div>
              </div>
            </li>
          ))
          : filteredThreads?.map((thread: ChatThread, index) => {
            const isActive = thread?._id === chatId;
            const thread_user = thread?.buyer?.id !== userId ? thread?.buyer : thread?.seller;
            return (
              <li key={index}>
                <button
                  type="button"
                  onClick={() => {
                    onSelectChat(thread);
                  }}
                  className={`flex w-full cursor-pointer items-start gap-3 px-4 py-4 text-left ${isActive ? "bg-[#E7F4F5]" : "hover:bg-gray-50"}`}
                >
                  <Image
                    src={"https://i.pravatar.cc/80?img=11"}
                    alt={thread_user?.name ?? ""}
                    width={44}
                    height={44}
                    className="h-11 w-11 rounded-full object-cover"
                    unoptimized
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-[15px] font-medium text-[#030303] first-letter:capitalize">{thread_user?.name ?? ""}</p>
                      <span className="shrink-0 text-[13px] font-normal text-[#4B514F]">{moment(thread.createdAt).locale(currentLanguage).fromNow()}</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <p className="truncate text-sm text-gray-600">I need iPhone 16 pro Gold Titanium...</p>
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
