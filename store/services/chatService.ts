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

    markAsRead: build.mutation({
      query: ({ id }: { id: string }) => {
        console.log(id, "id");
        return {
          url: `/notifications/${id}/read`,
          method: "PATCH",
        };
      },
      invalidatesTags: ["NOTIFICATIONS"],
    }),
  }),
});
export const { useGetAllConversationsForUserQuery, useMarkAsReadMutation } =
  chatService;
