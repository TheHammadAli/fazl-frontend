"use client";

import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { type ChatMessage } from "./types";
import { useDictionary } from "@/dictionaries/DictionaryProvider";
import camIcon from "@/assets/icons/cam-icon.svg";
import whiteArrowIcon from "@/assets/icons/white-arrow.svg";
import { getUserId } from "@/utils/getUserId";
import { useGetBroadcastThreadMessagesQuery, useGetConversationMessagesQuery, useMarkMessagesAsReadMutation, useSendBroadcastMessageMutation, useSendMessageMutation } from "@/store/services/chatService";
import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { parsePositiveInt } from "../Updates/Notifications";
import moment from "moment";
import { initializeSocket } from "@/utils/socket";
import baseApi from "@/store/baseApi";
import { useAppDispatch } from "@/store/store";
import { XMarkIcon } from "@heroicons/react/24/outline";
import noImageAvtar from "@/assets/images/profile-placehonder.png";
type ChatWindowProps = {
  thread: any;
  onBack?: () => void;
  threadType: string;
};
import noMessagesIcon from "@/assets/icons/no-message.svg";
import AvatarUi from "../Ui/AvatarUi";

export default function ChatWindow({ thread, onBack, threadType }: ChatWindowProps) {
  const { placeholders } = useDictionary();
  type PlaceholderKey = keyof typeof placeholders;
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
  const broadcastRequestId = isBroadcastReceived ? thread?.buyer : thread?.seller?.id || thread?.seller?._id
  const broadcastThreadId = isBroadcastReceived ? (thread?.threadId ?? "") : (conversationId ?? "");
  const headerUser = thread?.buyer?.id || thread?.buyer?._id !== userId ? thread?.buyer : thread?.seller;
  const headerName = headerUser?.name ?? thread?.name ?? "";
  const headerEmail = headerUser?.email ?? thread?.email ?? "";
  const headerAvatar = headerUser?.image ?? thread?.avatar ?? "https://i.pravatar.cc/80?img=11";
  const [messageText, setMessageText] = useState("");
  const [filteredMessages, setFilteredMessages] = useState<ChatMessage[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [markMessagesAsRead] = useMarkMessagesAsReadMutation();
  const [sendMessage, { isLoading: isSendingMessage }] = useSendMessageMutation();
  const [sendBroadcastMessage, { isLoading: isSendingBroadcastMessage }] = useSendBroadcastMessageMutation();
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
  const {
    data: broadcastMessages,
    isFetching: isFetchingBroadcastMessages,
    refetch: refetchBroadcastMessages,
  } = useGetBroadcastThreadMessagesQuery({
    id: broadcastRequestId,
    threadId: broadcastThreadId,
  }, {
    skip: threadType !== "broadcast_messages" || !broadcastRequestId || !broadcastThreadId,
    refetchOnMountOrArgChange: true,
  });
  const totalPages = parsePositiveInt(messages?.meta?.totalPages);
  const incomingMessages = (messages?.data as ChatMessage[] | undefined) ?? undefined;
  const isMessagesLoading =
    threadType === "broadcast_messages"
      ? isFetchingBroadcastMessages && filteredMessages.length === 0
      : isFetching && page === 1 && filteredMessages.length === 0;
  const canLoadMore =
    totalPages != null ? page < totalPages : messages?.meta?.total >= PAGE_LIMIT;
  const scrollToBottom = () => {
    const el = messagesContainerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  };
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
    if (messageText.trim() === "" && !selectedFile) {
      return;
    }
    try {

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
        const messageWithFile = {
          ...messageData,
          file: selectedFile,
        };
        const formData = new FormData();
        Object.entries(messageWithFile).forEach(([key, value]) => {
          if (value) {
            formData.append(key, value);
          }
        });
        sendBroadcastMessage({
          id: broadcastMessageId,
          body: selectedFile ? formData : messageData,
        }).unwrap().then((res) => {
          toast.success(res?.message ?? "Operation completed successfully");
          setMessageText("");
          setSelectedFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
          shouldStickToBottomRef.current = true;
          prevScrollHeightRef.current = 0;
          refetchBroadcastMessages();
          requestAnimationFrame(() => {
            scrollToBottom();
          });
        }).catch((err) => {
          toast.error(err?.data?.message ?? "Unable to send message");
        });
        return;
      }

      if (!conversationId) {
        return;
      }

      const buyerId = thread?.buyer?.id ?? thread?.buyer?._id ?? "";
      const sellerId = thread?.seller?.id ?? thread?.seller?._id ?? "";
      const receiverId = buyerId !== userId ? buyerId : sellerId;
      console.log("receiverId", receiverId);
      if (!receiverId) {
        toast.error("Unable to send message");
        return;
      }

      const messageData = {
        conversationId,
        text: messageText.trim(),
        senderId: userId,
        receiverId,
      };
      const messageWithFile = {
        ...messageData,
        file: selectedFile,
      };
      const formData = new FormData();
      Object.entries(messageWithFile).forEach(([key, value]) => {
        if (value) {
          formData.append(key, value);
        }
      });
      try {
        const socket = initializeSocket();
        if (!socket) {
          toast.error("Unable to send message");
          return;
        }
        // socket.emit('sendMessage', selectedFile ? formData : messageData);
        const res = await sendMessage(selectedFile ? formData : messageData).unwrap();
        toast.success(res?.message ?? "Operation completed successfully");
        setMessageText("");
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        shouldStickToBottomRef.current = true;
        prevScrollHeightRef.current = 0;
        setPage(1);
        refetch();
        requestAnimationFrame(() => {
          scrollToBottom();
        });
      } catch (err: unknown) {
        const message =
          err && typeof err === "object" && "data" in err
            ? (err as { data?: { message?: string } }).data?.message
            : undefined;
        toast.error(message ?? "Unable to send message");
      }
    } catch {
      toast.error("Unable to send message");

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
  }, [conversationId, markMessagesAsRead, userId, threadType, broadcastMessages?.data, broadcastThreadId, isBroadcastReceived, thread?._id, thread?.broadcastId]);

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
        <AvatarUi
          image={headerAvatar ?? noImageAvtar.src}
          name={headerName}
          className="h-11 w-11 rounded-full"
        />
        <div className="min-w-0">
          <p className="truncate text-[15px] font-semibold text-gray-900 first-letter:uppercase">{headerName}</p>
          <p className="truncate text-xs text-gray-500">{headerEmail}</p>
        </div>
      </header>

      <div ref={messagesContainerRef} onScroll={handleScrollNearBottom} className="flex-1 overflow-y-auto px-4 py-4 lg:px-8 lg:py-6">
        {isMessagesLoading ? (
          <div className="flex min-h-full flex-col justify-end gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={`msg-skeleton-${idx}`} className={`flex gap-2 items-end ${idx % 2 === 0 ? "justify-start" : "justify-end"}`}>
                {idx % 2 === 0 && <div className="h-[32px] w-[32px] rounded-full bg-gray-200 animate-pulse" />}
                <div className="max-w-[85%] lg:max-w-[60%]">
                  <div className="h-10 w-[180px] rounded-2xl bg-gray-200 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : sortedFilteredMessages?.length === 0 ?
          <div className="flex flex-col justify-center items-center h-full ">
            <Image src={noMessagesIcon} alt="no-messages-icon" />
            <h1 className="text-black-1 text-[22px] font-medium">
              {placeholders["start_conversation" as keyof typeof placeholders] ??
                "Start conversation"}
            </h1>
            <p className="text-[#4B514F] text-[14px] font-normal">
              {placeholders[
                "say_hi_to_begin_conversation" as keyof typeof placeholders
              ] ?? "Say hi to begin a conversation"}
            </p>
          </div>
          :
          <div className="flex min-h-full flex-col justify-end gap-6">
            {sortedFilteredMessages?.map((message: any, index: number) => {
              const mine = (threadType === "broadcast_messages" ? message?.sender?.id : message?.sender) === userId;
              const currentDateLabel = getDateLabel(message.createdAt);
              const previousDateLabel = getDateLabel(sortedFilteredMessages[index - 1]?.createdAt);
              const showDateSeparator = currentDateLabel && currentDateLabel !== previousDateLabel;
              const textContent =
                threadType === "broadcast_messages" ? message?.message : message?.text;
              const imageUrl = message?.imageUrl as string | undefined;
              const hasImage = Boolean(imageUrl?.trim());
              const showText = Boolean(textContent != null && String(textContent).trim());
              return (
                <div key={index}>
                  {showDateSeparator ? (
                    <p className="mb-2 text-center text-xs text-gray-400">{currentDateLabel}</p>
                  ) : null}
                  <div className={`flex gap-2 items-end ${mine ? "justify-end" : "justify-start"}`}>
                    {!mine && <AvatarUi image={headerAvatar ?? noImageAvtar.src} name={headerName} className="h-8 w-8 rounded-full" />}
                    <div
                      className={`w-fit max-w-[85%] overflow-hidden rounded-2xl lg:max-w-[60%] ${mine ? "bg-[#EEF2F3]" : "bg-[#F6F6F6]"}`}
                    >
                      {hasImage ? (
                        <div className="flex justify-center bg-black/[0.03]">
                          <Image
                            src={imageUrl}
                            alt=""
                            width={100}
                            height={100}
                            // sizes="(max-width: 768px) 72vw, 100%"
                            className="block h-auto w-auto object-contain"
                            unoptimized
                          />
                        </div>
                      ) : null}
                      {showText ? (
                        <div
                          className={`break-words text-sm leading-relaxed ${mine ? "text-[#030303]" : "text-gray-900"} ${hasImage ? "px-3 pb-2.5 pt-2" : "px-4 py-2.5"} whitespace-pre-wrap`}
                        >
                          {textContent}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        }
      </div>


      <div className="border-t  border-gray-200 bg-[white] px-3 py-2.5 lg:px-7">
        {selectedFile && <div className="w-[80px] h-[80px] relative">
          <div className="absolute cursor-pointer h-5 w-5 -top-2 -right-2 rounded-full bg-[red] flex items-center justify-center">
            <XMarkIcon
              onClick={() => {
                setSelectedFile(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
              }}
              className="h-4 w-4 text-white"
            />
          </div>
          {selectedFile && (
            <Image className="h-full w-full object-cover" src={URL.createObjectURL(selectedFile)} alt="selected-file" width={100} height={100} />
          )}
        </div>}
        <input
          id="file-input"
          ref={fileInputRef}
          onChange={(e) => {
            setSelectedFile(e.target.files?.[0] ?? null);
            e.currentTarget.value = "";
          }}
          type="file"
          accept="image/*"
          className="hidden"
        />
        <div className=" mt-3 flex items-center gap-2">
          {/* <button type="button" className="rounded-md p-1 text-gray-500 cursor-pointer">
            <Image src={camIcon} alt="cam-icon" />
          </button> */}
          <label htmlFor="file-input" className="rounded-md cursor-pointer p-1 text-gray-500">
            <Image src={camIcon} alt="cam-icon" />          </label>
          <div className="relative w-full">
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isSendingMessage && !isSendingBroadcastMessage) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={ph("write_a_message")}
              className=" bg-[#EEF2F3] w-full pr-8 rtl:pl-8 rounded-[10px] flex-1 h-10 text px-4 text-[#949494] text-sm outline-none placeholder:text-[#949494]"
            />
            <div className="absolute rtl:rotate-180 ltr:right-3 rtl:left-3 top-1/2 -translate-y-1/2 p-1 hover:bg-green-1/10 rounded-full">
              {isSendingMessage || isSendingBroadcastMessage ? (
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
