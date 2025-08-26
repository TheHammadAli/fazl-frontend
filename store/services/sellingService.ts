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
    // getUserDetail: build.query({
    //   query: (id) => {
    //     return {
    //       url: `/users/detail/${id}`,
    //       method: "GET",
    //     };
    //   },
    //   providesTags: ["profile"],
    // }),
  }),
});
export const { useCreateShopMutation } = profileService;
