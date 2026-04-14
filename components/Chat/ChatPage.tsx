"use client";

import { useMemo, useState } from "react";
import ChatSidebar from "./ChatSidebar";
import ChatWindow from "./ChatWindow";
import { useDictionary } from "@/dictionaries/DictionaryProvider";
import { type ChatMessage, type ChatThread } from "./types";

const THREADS: ChatThread[] = [
  {
    id: "1",
    name: "Nouman Malik",
    email: "nouman.malik99@gmail.com",
    preview: "",
    previewKey: "chat_preview_1",
    timeLabel: "23h",
    avatar: "https://i.pravatar.cc/80?img=11",
    unread: true,
  },
  {
    id: "2",
    name: "Babar Khan",
    preview: "",
    previewKey: "chat_preview_2",
    timeLabel: "23h",
    avatar: "https://i.pravatar.cc/80?img=32",
  },
  {
    id: "3",
    name: "Alex",
    preview: "",
    previewKey: "chat_preview_3",
    timeLabel: "3d",
    avatar: "https://i.pravatar.cc/80?img=13",
  },
];

const MESSAGES: ChatMessage[] = [
  { id: "m1", threadId: "1", textKey: "chat_message_1", mine: true, sentAtLabel: "06/07/2025" },
  { id: "m2", threadId: "1", textKey: "chat_message_2", mine: true },
  { id: "m3", threadId: "1", textKey: "chat_message_emoji", mine: true },
  { id: "m4", threadId: "1", textKey: "chat_message_emoji", mine: false, sentAtLabel: "06/07/2025" },
  { id: "m5", threadId: "1", textKey: "chat_message_3", mine: false },
];

export default function ChatPage() {
  const { placeholders } = useDictionary();
  type PlaceholderKey = keyof typeof placeholders;
  const ph = (key: PlaceholderKey) => placeholders[key];
  const [activeThreadId, setActiveThreadId] = useState(THREADS[0]?.id ?? "");
  const [mobileShowConversation, setMobileShowConversation] = useState(false);
  const [threadType, setThreadType] = useState("direct_messages");
  const activeThread = useMemo(
    () => THREADS.find((thread) => thread.id === activeThreadId) ?? THREADS[0],
    [activeThreadId],
  );

  const activeMessages = useMemo(() => {
    return MESSAGES.filter((message) => message.threadId === activeThread?.id).map((message) => ({
      ...message,
      text: message.textKey ? ph(message.textKey as PlaceholderKey) : message.text ?? "",
    }));
  }, [activeThread?.id, ph]);

  const localizedThreads = useMemo(() => {
    return THREADS.map((thread) => ({
      ...thread,
      preview: thread.previewKey ? ph(thread.previewKey as PlaceholderKey) : thread.preview,
    }));
  }, [ph]);

  if (!activeThread) return null;

  return (
    <div className="h-[calc(100dvh-80px)] overflow-hidden bg-white lg:h-screen">
      <div className="flex h-full">
        <div className={`${mobileShowConversation ? "hidden lg:block" : "block"} h-full w-full lg:w-auto`}>
          <ChatSidebar
            threadType={threadType}
            setThreadType={setThreadType}
            threads={localizedThreads}
            activeThreadId={activeThread.id}
            onSelectThread={(threadId) => {
              setActiveThreadId(threadId);
              setMobileShowConversation(true);
            }}
          />
        </div>

        <div className={`${mobileShowConversation ? "block" : "hidden lg:block"} h-full flex-1`}>
          <ChatWindow
            thread={activeThread}
            messages={activeMessages}
            onBack={() => setMobileShowConversation(false)}
          />
        </div>
      </div>
    </div>
  );
}
