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
    getAllCategories: build.query({
      query: () => {
        return {
          url: `/categories`,
          method: "GET",
        };
      },
    }),
    addService: build.mutation({
      query: (body) => ({
        url: "/services/create",
        method: "POST",
        body,
      }),
    }),
    getShopDetail: build.query({
      query: (id) => {
        return {
          url: `/shops/detail/${id}`,
          method: "GET",
        };
      },
    }),

    getShopProducts: build.query({
      query: (id) => {
        return {
          url: `/products/${id}`,
          method: "GET",
        };
      },
    }),

    listProduct: build.mutation({
      query: ({ id, formData, type }) => ({
        url: `/products/${id}/${type}`,
        method: "POST",
        body: formData,
      }),
    }),

    orderProduct: build.mutation({
      query: (body) => ({
        url: "/orders",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useOrderProductMutation,
  useGetShopProductsQuery,
  useListProductMutation,
  useGetShopDetailQuery,
  useAddServiceMutation,
  useCreateShopMutation,
  useGetUsersShopsQuery,
  useGetAllCategoriesQuery,
} = profileService;
