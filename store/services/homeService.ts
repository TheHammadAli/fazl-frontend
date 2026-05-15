import { baseApi } from "../baseApi";
export const homeService = baseApi.injectEndpoints({
  endpoints: (build) => ({
    searchProducts: build.query({
      query: (params: any) => {
        return {
          url: `/search/all-products?${new URLSearchParams(params)}`,
          method: "GET",
        };
      },
    }),
    searchServices: build.query({
      query: (params: any) => {
        return {
          url: `/search/all-services?${new URLSearchParams(params)}`,
          method: "GET",
        };
      },
    }),
    getProductDetail: build.query({
      query: (id) => {
        return {
          url: `/products/detail/${id}`,
          method: "GET",
        };
      },
      providesTags: ["PRODUCT"],
    }),
  }),
});
export const {
  useGetProductDetailQuery,
  useSearchProductsQuery,
  useSearchServicesQuery,
} = homeService;
