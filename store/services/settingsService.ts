import { baseApi } from "../baseApi";

export const settingsService = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getSocialLinks: build.query({
      query: () => ({
        url: `/settings/social-links`,
        method: "GET",
      }),
      providesTags: ["SETTINGS"],
    }),
  }),
});

export const { useGetSocialLinksQuery } = settingsService;
