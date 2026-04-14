export type ChatThread = {
  id: string;
  name: string;
  email?: string;
  preview: string;
  previewKey?: string;
  timeLabel: string;
  avatar: string;
  unread?: boolean;
};

export type ChatMessage = {
  id: string;
  threadId: string;
  text?: string;
  textKey?: string;
  sentAtLabel?: string;
  mine: boolean;
};
