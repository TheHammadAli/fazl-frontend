"use client";

import { useCallback, useEffect, useState } from "react";
import ChatSidebar from "./ChatSidebar";
import ChatWindow from "./ChatWindow";
import { type ChatThread } from "./types";
import { useSearchParams } from "next/navigation";
import noMessagesIcon from "@/assets/icons/no-message.svg";
import Image from "next/image";
import { useDictionary } from "@/dictionaries/DictionaryProvider";

type BroadcastSubTab = "sent" | "received";

export default function ChatPage() {
  const { placeholders } = useDictionary();
  const params = useSearchParams();
  const [mobileShowConversation, setMobileShowConversation] = useState(false);
  const [threadType, setThreadType] = useState("direct_messages");
  const [chatId, setChatId] = useState("");
  const [selectedThread, setSelectedThread] = useState<ChatThread | null>(null);
  const [broadcastSubTab, setBroadcastSubTab] = useState<BroadcastSubTab>("sent");

  const handleSelectChat = useCallback((thread: ChatThread | null) => {
    if (!thread) {
      setSelectedThread(null);
      setChatId("");
      setMobileShowConversation(false);
      return;
    }

    if (thread.type === "broadcast_received") {
      setSelectedThread(thread);
      setChatId(thread.threadId ?? "");
      setMobileShowConversation(true);
      return;
    }

    const nextId = thread._id ?? thread.id;
    setSelectedThread((prev) => {
      if (!prev) return thread;
      const prevId = prev._id ?? prev.id;
      const prevBroadcastId = prev.broadcastId ?? "";
      const nextBroadcastId = thread.broadcastId ?? "";
      if (prevId === nextId && prevBroadcastId === nextBroadcastId) {
        return prev;
      }
      return thread;
    });
    setChatId((prev) => (prev === nextId ? prev : nextId ?? ""));
    setMobileShowConversation(true);
  }, []);

  useEffect(() => {
    const chatIdParam = params.get("chatId");
    if (chatIdParam) {
      setChatId(chatIdParam);
    }

    const tab = params.get("tab");
    const threadTypeParam = params.get("threadType");
    if (tab === "broadcast_messages" || threadTypeParam === "broadcast") {
      setThreadType("broadcast_messages");
    }

    const type = params.get("type");
    if (type === "received" || type === "sent") {
      setBroadcastSubTab(type);
    }
  }, [params]);

  useEffect(() => {
    if (threadType === "broadcast_messages") {
      // Keep chatId when deep-linking into a specific received thread.
      if (!params.get("chatId")) {
        setChatId("");
        setSelectedThread(null);
      }
      return;
    }

    if (threadType === "direct_messages") {
      if (params.get("chatId")) {
        setChatId(params.get("chatId") || "");
      } else {
        setChatId("");
      }
    }
  }, [threadType, params]);

  const handleSetThreadType = useCallback((next: string) => {
    setThreadType(next);
    if (next === "broadcast_messages") {
      setBroadcastSubTab("sent");
    }
  }, []);

  return (
    <div className="h-[calc(100dvh-80px)] overflow-hidden bg-white lg:h-screen">
      <div className="flex h-full">
        <div className={`${mobileShowConversation ? "hidden lg:block" : "block"} h-full w-full lg:w-auto`}>
          <ChatSidebar
            threadType={threadType}
            setThreadType={handleSetThreadType}
            chatId={chatId}
            onSelectChat={handleSelectChat}
            broadcastSubTab={broadcastSubTab}
            onBroadcastSubTabChange={setBroadcastSubTab}
          />
        </div>
        <div className={`${mobileShowConversation ? "block" : "hidden lg:block"} h-full flex-1`}>
          {selectedThread ? (
            <ChatWindow
              threadType={threadType}
              thread={selectedThread}
              onBack={() => setMobileShowConversation(false)}
            />
          ) : (
            <div className="h-full w-full">
              <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                <Image src={noMessagesIcon} alt="no-messages-icon" />
                <h3 className="mt-1 text-[22px] font-medium  text-black-1">{placeholders.no_messages_yet}</h3>
                <p className="mt-1 max-w-[560px] text-[14px] font-normal  text-gray-8">
                  {placeholders.messages_appear_here}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
