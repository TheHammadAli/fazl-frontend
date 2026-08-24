import { baseApi } from "../baseApi";

export type GetProductDetailParams = string | { id: string; userId?: string };

function normalizeProductDetailParams(
  params: GetProductDetailParams,
): { id: string; userId?: string } {
  if (typeof params === "string") {
    return { id: params };
  }
  return params;
}

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
      query: (params: GetProductDetailParams) => {
        const { id, userId } = normalizeProductDetailParams(params);
        const search = userId ? `?${new URLSearchParams({ userId })}` : "";
        return {
          url: `/products/detail/${id}${search}`,
          method: "GET",
        };
      },
      providesTags: ["PRODUCT"],
    }),
    trackProductView: build.mutation({
      query: (id: string) => ({
        url: `/products/${id}/track-view`,
        method: "POST",
      }),
    }),
    trackProductContactClick: build.mutation({
      query: (id: string) => ({
        url: `/products/${id}/track-contact-click`,
        method: "POST",
      }),
    }),
    trackProductWhatsappClick: build.mutation({
      query: (id: string) => ({
        url: `/products/${id}/track-whatsapp-click`,
        method: "POST",
      }),
    }),
  }),
});
export const {
  useGetProductDetailQuery,
  useSearchProductsQuery,
  useSearchServicesQuery,
  useTrackProductViewMutation,
  useTrackProductContactClickMutation,
  useTrackProductWhatsappClickMutation,
} = homeService;
