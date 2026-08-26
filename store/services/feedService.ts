import { baseApi } from "../baseApi";
export const feedService = baseApi.injectEndpoints({
  // Next.js dev-mode Fast Refresh re-executes this module (and re-injects the
  // same endpoint names) on every edit; without this it logs a harmless but
  // noisy RTK Query warning. No effect in production, where the module only
  // ever runs once.
  overrideExisting: process.env.NODE_ENV === "development",
  endpoints: (build) => ({
    getAllProductsFeed: build.query({
      query: ({ page, limit }: { page: number; limit: number }) => {
        return {
          url: `/products/with-videos/all?page=${page}&limit=${limit}`,
          method: "GET",
        };
      },
    }),
    getAllServicesFeed: build.query({
      query: ({ page, limit }: { page: number; limit: number }) => {
        return {
          url: `/services/with-videos/all?page=${page}&limit=${limit}`,
          method: "GET",
        };
      },
    }),
    likeVideo: build.mutation({
      query: (body: any) => {
        return {
          url: `/likes`,
          method: "POST",
          body,
        };
      },
      // Not "PRODUCT" — every screen that shows like state already applies its
      // own optimistic update, so invalidating it just forced a visible
      // refetch/reload of the whole product detail page for no reason.
      invalidatesTags: ["FAVOURITES"],
    }),
    unlikeVideo: build.mutation({
      query: (body: any) => {
        return {
          url: `/likes`,
          method: "DELETE",
          body,
        };
      },
      invalidatesTags: ["FAVOURITES"],
    }),
    likedVideoByUser: build.query({
      query: ({ userId, type }: any) => {
        return {
          url: `/likes/user/${userId}?itemType=${type}`,
          method: "GET",
        };
      },
    }),
    getUserFavourites: build.query({
      query: (userId: string) => ({
        url: `/likes/user/${userId}`,
        method: "GET",
      }),
      providesTags: ["FAVOURITES"],
    }),
    trackShare: build.mutation({
      query: (body: { itemId: string; itemType: "product" | "service" }) => {
        return {
          url: `/shares`,
          method: "POST",
          body,
        };
      },
    }),
  }),
});
export const {
  useLikedVideoByUserQuery,

  useLikeVideoMutation,
  useUnlikeVideoMutation,
  useTrackShareMutation,
  useGetAllProductsFeedQuery,
  useGetAllServicesFeedQuery,
  useGetUserFavouritesQuery,
} = feedService;
