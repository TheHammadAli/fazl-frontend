import { baseApi } from "../baseApi";
export const chatService = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAllConversationsForUser: build.query({
      query: ({
        id,
        page,
        limit,
      }: {
        id: string;
        page: number;
        limit: number;
      }) => {
        return {
          url: `/chat/conversations/${id}?page=${page}&limit=${limit}`,
          method: "GET",
        };
      },
      providesTags: ["Chat"],
    }),
    initiateChat: build.mutation({
      query: ({ buyerId, sellerId }: { buyerId: string; sellerId: string }) => {
        return {
          url: `/chat/conversation`,
          method: "POST",
          body: { buyerId, sellerId },
        };
      },
      invalidatesTags: ["Chat"],
    }),
    getConversationMessages: build.query({
      query: ({
        conversationId,
        page,
        limit,
      }: {
        conversationId: string;
        page: number;
        limit: number;
      }) => {
        return {
          url: `/chat/messages/${conversationId}?page=${page}&limit=${limit}`,
          method: "GET",
        };
      },
      providesTags: ["Chat"],
    }),
    sendMessage: build.mutation({
      query: (body: {
        conversationId: string;
        text: string;
        senderId: string;
        receiverId: string;
      }) => {
        return {
          url: `/chat/message`,
          method: "POST",
          body: body,
        };
      },
      invalidatesTags: ["Chat"],
    }),
    unreadMessagesCount: build.query({
      query: ({ userId }: { userId: string }) => {
        return {
          url: `/chat/messages/unread/${userId}`,
          method: "GET",
        };
      },
      providesTags: ["Chat"],
    }),
    markMessagesAsRead: build.mutation({
      query: ({
        conversationId,
        userId,
      }: {
        conversationId: string;
        userId: string;
      }) => {
        return {
          url: `/chat/messages/mark-read`,
          method: "PATCH",
          body: { conversationId, userId },
        };
      },
      invalidatesTags: ["Chat"],
    }),
  }),
});
export const {
  useMarkMessagesAsReadMutation,
  useUnreadMessagesCountQuery,
  useSendMessageMutation,
  useGetAllConversationsForUserQuery,
  useInitiateChatMutation,
  useGetConversationMessagesQuery,
} = chatService;
