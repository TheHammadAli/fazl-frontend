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
      providesTags: ["SHOP_DETAIL"],
    }),

    getShopProducts: build.query({
      query: (id) => {
        return {
          url: `/products/${id}`,
          method: "GET",
        };
      },
      providesTags: ["PRODUCT"],
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
    updateProduct: build.mutation({
      query: ({ id, formData }) => ({
        url: `/products/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["PRODUCT"],
    }),
    deleteProductMedia: build.mutation({
      query: ({ id, body }) => ({
        url: `/products/${id}/media`,
        method: "DELETE",
        body: body,
      }),
    }),
    updateShop: build.mutation({
      query: ({ id, formData }) => ({
        url: `/shops/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["SHOP_DETAIL"],
    }),
  }),
});

export const {
  useUpdateShopMutation,
  useDeleteProductMediaMutation,
  useUpdateProductMutation,
  useOrderProductMutation,
  useGetShopProductsQuery,
  useListProductMutation,
  useGetShopDetailQuery,
  useAddServiceMutation,
  useCreateShopMutation,
  useGetUsersShopsQuery,
  useGetAllCategoriesQuery,
} = profileService;
