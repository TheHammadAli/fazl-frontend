"use client";

import { useCallback, useEffect, useState } from "react";
import ChatSidebar from "./ChatSidebar";
import ChatWindow from "./ChatWindow";
import { type ChatThread } from "./types";
import { useSearchParams } from "next/navigation";



export default function ChatPage() {
  const params = useSearchParams();
  const [mobileShowConversation, setMobileShowConversation] = useState(false);
  const [threadType, setThreadType] = useState("direct_messages");
  const [chatId, setChatId] = useState("");
  const [selectedThread, setSelectedThread] = useState<ChatThread | null>(null);
  const handleSelectChat = useCallback((thread: ChatThread) => {
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
    const chatId = params.get("chatId");
    if (chatId) {
      setChatId(chatId || "");
    }
    if (params.get("threadType") === "broadcast") {
      setThreadType("broadcast_messages");
    }
  }, [params]);
  useEffect(() => {
    if (threadType === "broadcast_messages") {
      setChatId("");
      setSelectedThread(null);
    }
    if (threadType === "direct_messages") {
      if (params.get("chatId")) {
        setChatId(params.get("chatId") || "");
      }
      else {
        setChatId("");
      }
    }
  }, [threadType, params]);


  return (
    <div className="h-[calc(100dvh-80px)] overflow-hidden bg-white lg:h-screen">
      <div className="flex h-full">
        <div className={`${mobileShowConversation ? "hidden lg:block" : "block"} h-full w-full lg:w-auto`}>
          <ChatSidebar
            threadType={threadType}
            setThreadType={setThreadType}
            chatId={chatId}
            onSelectChat={handleSelectChat}
          />
        </div>

        <div className={`${mobileShowConversation ? "block" : "hidden lg:block"} h-full flex-1`}>
          {selectedThread ? (
            <ChatWindow
              threadType={threadType}
              thread={selectedThread}
              onBack={() => setMobileShowConversation(false)}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
