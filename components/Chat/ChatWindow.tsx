"use client";

import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { type ChatMessage } from "./types";
import { useDictionary } from "@/dictionaries/DictionaryProvider";
import camIcon from "@/assets/icons/cam-icon.svg";
import SquareAddIcon from "@/assets/icons/add-square.svg";
import whiteArrowIcon from "@/assets/icons/white-arrow.svg";
import { getUserId } from "@/utils/getUserId";
import { useGetBroadcastThreadMessagesQuery, useGetConversationMessagesQuery, useMarkMessagesAsReadMutation, useSendBroadcastMessageMutation } from "@/store/services/chatService";
import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { parsePositiveInt } from "../Updates/Notifications";
import moment from "moment";
import { initializeSocket } from "@/utils/socket";
import baseApi from "@/store/baseApi";
import { useAppDispatch } from "@/store/store";
type ChatWindowProps = {
  thread: any;
  onBack?: () => void;
  threadType: string;
};

export default function ChatWindow({ thread, onBack, threadType }: ChatWindowProps) {
  const { placeholders } = useDictionary();
  type PlaceholderKey = keyof typeof placeholders;
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const ph = (key: PlaceholderKey) => placeholders[key];
  const PAGE_LIMIT = 15;
  const [page, setPage] = useState(1);
  const getDateLabel = (createdAt?: string) => {
    if (!createdAt) return "";
    const date = moment(createdAt);
    if (!date.isValid()) return "";
    if (date.isSame(moment(), "day")) return ph("today");
    if (date.isSame(moment().subtract(1, "day"), "day")) return ph("yesterday");
    return date.format("MM/DD/YYYY");
  };
  const dispatch = useAppDispatch();
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const prevScrollHeightRef = useRef(0);
  const shouldStickToBottomRef = useRef(true);
  const userId = getUserId() ?? "";
  const conversationId = thread?._id ?? thread?.id ?? "";
  const isBroadcastReceived = thread?.type === "broadcast_received";
  const broadcastRequestId = isBroadcastReceived ? thread?.buyer : thread?.seller?.id
  const broadcastThreadId = isBroadcastReceived ? (thread?.threadId ?? "") : (conversationId ?? "");
  const headerUser = thread?.buyer?.id !== userId ? thread?.buyer : thread?.seller;
  const headerName = headerUser?.name ?? thread?.name ?? "";
  const headerEmail = headerUser?.email ?? thread?.email ?? "";
  const headerAvatar = headerUser?.image ?? thread?.avatar ?? "https://i.pravatar.cc/80?img=11";
  const [messageText, setMessageText] = useState("");
  const [filteredMessages, setFilteredMessages] = useState<ChatMessage[]>([]);
  const [markMessagesAsRead] = useMarkMessagesAsReadMutation();
  const messagesQueryArgs = useMemo(
    () => ({
      conversationId,
      page,
      limit: PAGE_LIMIT,
    }),
    [conversationId, page],
  );
  const { data: messages, isFetching, refetch } = useGetConversationMessagesQuery(messagesQueryArgs, {
    skip: !conversationId || threadType === "broadcast_messages",
    refetchOnMountOrArgChange: true,
  });
  const { data: broadcastMessages, refetch: refetchBroadcastMessages } = useGetBroadcastThreadMessagesQuery({
    id: broadcastRequestId,
    threadId: broadcastThreadId,
  }, {
    skip: threadType !== "broadcast_messages" || !broadcastRequestId || !broadcastThreadId,
    refetchOnMountOrArgChange: true,
  });
  const [sendBroadcastMessage] = useSendBroadcastMessageMutation();
  const totalPages = parsePositiveInt(messages?.meta?.totalPages);
  const incomingMessages = (messages?.data as ChatMessage[] | undefined) ?? undefined;
  const canLoadMore =
    totalPages != null ? page < totalPages : messages?.meta?.total >= PAGE_LIMIT;
  function handleScrollNearBottom(e: React.UIEvent<HTMLDivElement>) {
    if (threadType === "broadcast_messages") return;
    const el = e.currentTarget;
    shouldStickToBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight <= 120;
    if (!userId || isFetching || !canLoadMore) return;
    const nearTop = el.scrollTop <= 80;
    if (!nearTop) return;
    prevScrollHeightRef.current = el.scrollHeight;
    setPage((p) => p + 1);
  }
  const handleSendMessage = async () => {
    if (messageText.trim() === "") {
      return;
    }
    try {
      setIsSendingMessage(true);

      if (threadType === "broadcast_messages") {
        const broadcastMessageId = isBroadcastReceived ? thread?._id : thread?.broadcastId;
        if (!broadcastMessageId || !broadcastThreadId || !broadcastRequestId) {
          toast.error("Unable to send message");
          return;
        }
        const socket = initializeSocket();
        if (!socket) {
          toast.error("Unable to send message");
          return;
        }

        const messageData = {
          broadcastId: broadcastMessageId,
          threadId: broadcastThreadId,
          senderId: userId,
          receiverId: broadcastRequestId,
          message: messageText.trim(),
        };
        socket?.emit('sendBroadcastMessage', messageData);

        // await sendBroadcastMessage({
        //   id: broadcastMessageId,
        //   body,
        // }).unwrap();

        toast.success("Operation completed successfully");
        setMessageText("");
        shouldStickToBottomRef.current = true;
        prevScrollHeightRef.current = 0;
        await refetchBroadcastMessages();
        return;
      }

      if (!conversationId) {
        return;
      }

      const socket = initializeSocket();
      if (!socket) {
        toast.error("Unable to send message");
        return;
      }
      socket.emit("sendMessage", {
        conversationId,
        text: messageText,
        senderId: userId,
        receiverId: thread?.buyer?.id !== userId ? thread?.buyer?.id ?? "" : thread?.seller?.id ?? "",
      });
      // Keep spinner visible briefly while socket event propagates.
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success("Operation completed successfully");
      setMessageText("");
      shouldStickToBottomRef.current = true;
      prevScrollHeightRef.current = 0;
      setPage(1);
      refetch();

    } catch {
      toast.error("Unable to send message");

    } finally {
      setIsSendingMessage(false);
    }
  }
  useEffect(() => {
    if (threadType !== "broadcast_messages" || !broadcastRequestId || !broadcastThreadId) return;
    refetchBroadcastMessages();
  }, [threadType, broadcastRequestId, broadcastThreadId, refetchBroadcastMessages]);

  useEffect(() => {
    if (threadType === "broadcast_messages") {
      const incomingBroadcastMessages = (broadcastMessages?.data as ChatMessage[] | undefined) ?? [];
      setFilteredMessages(incomingBroadcastMessages);
    }
  }, [threadType, conversationId, broadcastMessages?.data]);

  useEffect(() => {
    if (threadType === "direct_messages") {
      if (!incomingMessages) return;
      if (page === 1) {
        setFilteredMessages(incomingMessages);
      } else {
        setFilteredMessages((prev) => [...prev, ...incomingMessages]);
      }
    }
  }, [threadType, incomingMessages, page]);
  useEffect(() => {
    const socket = initializeSocket();
    if (!socket) return;
    setPage(1);
    if (threadType === "broadcast_messages") {
      const incomingBroadcastMessages = (broadcastMessages?.data as ChatMessage[] | undefined) ?? [];
      setFilteredMessages(incomingBroadcastMessages);
    } else {
      setFilteredMessages([]);
    }
    shouldStickToBottomRef.current = true;
    prevScrollHeightRef.current = 0;
    socket?.emit('joinConversation', { conversationId });
    socket?.emit('joinBroadcast', {
      threadId: broadcastThreadId,
      broadcastId: isBroadcastReceived ? thread?._id : thread?.broadcastId,
    });


    if (conversationId && userId && threadType === "direct_messages") {
      markMessagesAsRead({ conversationId, userId }).unwrap().catch(() => {
        // Keep chat usable even if marking read fails.
      });
    }
  }, [conversationId, markMessagesAsRead, userId, threadType, broadcastMessages?.data]);

  const sortedFilteredMessages = useMemo(
    () =>
      [...filteredMessages].sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return aTime - bTime;
      }),
    [filteredMessages],
  );
  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    if (page > 1 && prevScrollHeightRef.current > 0) {
      const heightDiff = el.scrollHeight - prevScrollHeightRef.current;
      el.scrollTop = el.scrollTop + heightDiff;
      prevScrollHeightRef.current = 0;
      return;
    }
    if (shouldStickToBottomRef.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, [page, sortedFilteredMessages]);
  useEffect(() => {
    const socket = initializeSocket();
    if (!socket) return;
    socket.on("receiveMessage", (data) => {
      console.log(data, "message received");
      dispatch(baseApi.util.invalidateTags(["Chat"]));
    });

    socket.on("receiveBroadcastMessage", () => {
      dispatch(baseApi.util.invalidateTags(["BROADCAST"]));
    }

    )
  }, [dispatch]);
  return (
    <section className="flex h-full min-h-0 flex-1 flex-col">
      <header className="flex h-16 items-center gap-3 border-b border-gray-200 bg-white px-4 lg:px-8">
        {onBack ? (
          <button type="button" onClick={onBack} className="rounded-md p-1 text-gray-700 lg:hidden">
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
        ) : null}
        <Image
          src={headerAvatar}
          alt={headerName}
          width={44}
          height={44}
          className="h-11 w-11 rounded-full object-cover"
          unoptimized
        />
        <div className="min-w-0">
          <p className="truncate text-[15px] font-semibold text-gray-900 first-letter:uppercase">{headerName}</p>
          <p className="truncate text-xs text-gray-500">{headerEmail}</p>
        </div>
      </header>

      <div ref={messagesContainerRef} onScroll={handleScrollNearBottom} className="flex-1 overflow-y-auto px-4 py-4 lg:px-8 lg:py-6">
        <div className="flex min-h-full flex-col justify-end gap-6">
          {sortedFilteredMessages.map((message: any, index: number) => {
            console.log(message, "message");
            const mine = (threadType === "broadcast_messages" ? message?.sender?.id : message?.sender) === userId;
            const currentDateLabel = getDateLabel(message.createdAt);
            const previousDateLabel = getDateLabel(sortedFilteredMessages[index - 1]?.createdAt);
            const showDateSeparator = currentDateLabel && currentDateLabel !== previousDateLabel;
            return (
              <div key={index}>
                {showDateSeparator ? (
                  <p className="mb-2 text-center text-xs text-gray-400">{currentDateLabel}</p>
                ) : null}
                <div className={`flex gap-2 items-end ${mine ? "justify-end" : "justify-start"}`}>
                  {!mine && <div className="h-[32px] w-[32px] rounded-full bg-gray-200">
                    <Image src={headerAvatar} alt="sender-image" width={32} height={32} unoptimized className="h-full w-full rounded-full object-cover" />
                  </div>}
                  <div
                    className={`max-w-[85%] break-words rounded-2xl px-4 py-2 text-sm leading-relaxed lg:max-w-[60%] ${mine ? "bg-[#EEF2F3] text-[#030303]" : "bg-[#F6F6F6] text-gray-900"}`}
                  >
                    {threadType === "broadcast_messages" ? message.message : message.text}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
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
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isSendingMessage) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={ph("write_a_message")}
              className=" bg-[#EEF2F3] w-full pr-8 rtl:pl-8 rounded-[10px] flex-1 h-10 text px-4 text-[#949494] text-sm outline-none placeholder:text-[#949494]"
            />
            <div className="absolute rtl:rotate-180 ltr:right-3 rtl:left-3 top-1/2 -translate-y-1/2 p-1 hover:bg-green-1/10 rounded-full">
              {isSendingMessage ? (
                <span className="">
                  <span className="block h-4 w-4 animate-spin rounded-full border-2 border-[#3C9197] border-t-transparent" />
                </span>
              ) : (
                <Image
                  onClick={() => handleSendMessage()}
                  src={whiteArrowIcon}
                  alt="white-arrow-icon"
                  className="cursor-pointer"
                />
              )}</div>

          </div>
        </div>
      </div>
    </section>
  );
}
