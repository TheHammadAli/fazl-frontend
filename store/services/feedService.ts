import { baseApi } from "../baseApi";
export const feedService = baseApi.injectEndpoints({
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
  }),
});
export const { useGetAllProductsFeedQuery, useGetAllServicesFeedQuery } =
  feedService;
