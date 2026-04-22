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
      providesTags: ["SHOP_DETAIL"],
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
    getUserProducts: build.query({
      query: (id) => {
        return {
          url: `/products/user/${id}`,
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
      invalidatesTags: ["PRODUCT"],
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
    updateService: build.mutation({
      query: ({ id, formData }) => ({
        url: `/services/update/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["SERVICES"],
    }),
    serviceBookRequest: build.mutation({
      query: (body) => ({
        url: "/services/create-request",
        method: "POST",
        body,
      }),
    }),
    deleteProductMedia: build.mutation({
      query: ({ id, body }) => ({
        url: `/products/${id}/media`,
        method: "DELETE",
        body: body,
      }),
    }),
    deleteServiceMedia: build.mutation({
      query: ({ id, body }) => ({
        url: `/services/${id}/media`,
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
    getShopOrders: build.query({
      query: (id) => {
        return {
          url: `/orders/owner/${id}?ownerModel=Shop&page=1&limit=50`,
          method: "GET",
        };
      },
    }),
    getUserService: build.query({
      query: (id) => {
        return {
          url: `/services/user/${id}`,
          method: "GET",
        };
      },
    }),
    getServiceDetail: build.query({
      query: (id) => {
        return {
          url: `/services/${id}`,
          method: "GET",
        };
      },
      providesTags: ["SERVICES"],
    }),
    getServicesRequests: build.query({
      query: ({ id, page, limit }) => {
        return {
          url: `/services/requests/${id}?page=${page}&limit=${limit}`,
          method: "GET",
        };
      },
      providesTags: ["SERVICES_REQUESTS"],
    }),
    updateServiceRequest: build.mutation({
      query: (body) => ({
        url: `/services/status`,
        method: "PATCH",
        body: body,
      }),
      invalidatesTags: ["SERVICES_REQUESTS"],
    }),

    startJob: build.mutation({
      query: (body) => ({
        url: `/services/job-status`,
        method: "PATCH",
        body: body,
      }),
      invalidatesTags: ["SERVICES_REQUESTS"],
    }),
  }),
});
export const {
  useStartJobMutation,
  useUpdateServiceRequestMutation,
  useGetServicesRequestsQuery,
  useDeleteServiceMediaMutation,
  useGetServiceDetailQuery,
  useGetUserServiceQuery,
  useGetShopOrdersQuery,
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
  useUpdateServiceMutation,
  useGetUserProductsQuery,
  useServiceBookRequestMutation,
} = profileService;
