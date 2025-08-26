import { baseApi } from "../baseApi";
export const profileService = baseApi.injectEndpoints({
  endpoints: (build) => ({
    createShop: build.mutation({
      query: (body) => ({
        url: "/shops/create",
        method: "POST",
        body,
      }),
      invalidatesTags: [],
    }),
    getUsersShops: build.query({
      query: () => {
        return {
          url: `/shops/userShops`,
          method: "GET",
        };
      },
    }),
  }),
});
export const { useCreateShopMutation, useGetUsersShopsQuery } = profileService;
