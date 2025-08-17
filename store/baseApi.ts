import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "@/assets/content/constants";
// import { getToken } from "../utils/getToken";

const excludeToken = [""];
export const baseApi = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers, { endpoint }) => {
      // const token = getToken();
      // if (!excludeToken.includes(endpoint) && token) {
      //   headers.set("Authorization", `bearer ${token}`);
      // }
      return headers;
    },
  }),
  tagTypes: [
    "COURSES",
    "SINGLEGROUP",
    "CATEGORIES",
    "CATEGORIES_WITHOUT_TOKEN",
    "SUBCATEGORIES",
    "SUBCATEGORIES_WITHOUT_TOKEN",
    "COURSES",
    "TOPICS",
    "LEVELS",
    "SERVICES_COUNTS",
    "SLOTS",
    "SESSIONS",
    "COURSE_METADATA",
    "GROUPS",
    "ALL_FOCUSES",
    "PVT_CLASS_SLOTS",
    "PVT_CLASS_PACKAGES",
    "PRIVATE_CLASSES",
    "PVT_CLASS_DETAILS",
    "SINGLE_COURSE_DETAILS",
    "RESOURCE",
    "REVIEWS",
    "REPLIES",
    "ALL_POST",
    "FOLLOWS",
    "FOLLOWS_FOLLOWING_COUNT",
    "ENROLLED_LEARNERS",
    "PROFILE_DATA",
    "ALL_TAGS",
    "ALL_POST_TAG",
    "SINGLE_DETAILED_CLUB",
    "DRAFTS",
    "SEEN_ALL_MESSAGES",
    "ALL_CHATS",
    "SINGLE_CHATS",
    "SINGLE_POST_THREAD",
    "JOINED_SERVICES",
    "PROFILE-DETAILS",
    "PAYMENT-DETAILS",
    "CLUB_LEARNERS",
    "CLUB_LEARNERS_BY_REPORTS",
    "REPORTS",
    "CLUB_RESOURCES_BY_REPORTS",
    "CLUBS",
    "LEARNERS_CLUBS",
    "INSTRUCTOR_SERVICES",
    "INSTRUCTOR-APPROVALS",
    "COURSES_APPROVALS",
    "CLASSES_APPROVALS",
    "CLUBS_APPROVALS",
    "INSTRUCTOR_SERVICES",
    "PROMOTIONS",
    "ENROLL_PAYMENT",
    "CLASS_ENROLL_PAYMENT",
    "JOIN_CLUB",
    "SEEN_ALL_ANNOUNCEMENTS",
    "FEATURED_SERVICES",
    "DELETE_SERVICE",
    "TRAFFIC_CONVERSION",
    "PERFORMANCE_BADGES",
    "SCHEDULE",
    "UNREAD_COUNT",
    "READ_NOTIFICATION",
    "NOTIFICATION_READ",
    "APPROVED_INSTRUCTORS",
    "SHOW_RESULTS_PROMOS",
    "MILESTONES",
    "SESSION_CHAT",
    "CLASS_RESCHEDULE_REQUEST",
    "CLASS_EXTRA_CHARGES",
    "COURSE_CANCEL",
    "COURSE_RESCHEDULE",
    "REJECT_SERVICES",
    "BOOKING_INFO",
  ],
  endpoints: (builder) => ({}),
});

// Needed code for refresh token in near future //
// import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
// import { BASE_URL } from '@/constants/Constants';
// import { getToken, setToken } from '../utils/tokenUtils';
// import { logout } from '../features/auth/authSlice';
// const baseQuery = fetchBaseQuery({
//   baseUrl: BASE_URL,
//   prepareHeaders: (headers, { endpoint }) => {
//     const token = getToken();
//     if (token && !excludeToken.includes(endpoint)) {
//       headers.set('Authorization', `Bearer ${token}`);
//     }
//     return headers;
//   },
// });

// const baseQueryWithReauth = async (args, api, extraOptions) => {
//   let result = await baseQuery(args, api, extraOptions);

//   if (result.error && result.error.status === 401) {
//     // Attempt to refresh the token
//     const refreshResult = await baseQuery(
//       {
//         url: '/auth/refresh-token',
//         method: 'POST',
//         body: { token: getToken() }, // Adjust according to your refresh token structure
//       },
//       api,
//       extraOptions
//     );

//     if (refreshResult.data) {
//       // Store the new token
//       setToken(refreshResult.data.token);
//       // Retry the original query with the new token
//       result = await baseQuery(args, api, extraOptions);
//     } else {
//       // Handle token refresh failure (e.g., redirect to login)
//       api.dispatch(logout());
//     }
//   }

//   return result;
// };

// export default baseQueryWithReauth;
