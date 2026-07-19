"use client";

import { Provider } from "react-redux";
import store from "@/store/store";
import { Toaster } from "react-hot-toast";
import SessionRestorer from "@/components/Auth/SessionRestorer";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <SessionRestorer />
      <Toaster
        toastOptions={{
          className: "first-letter:uppercase text-start",
          duration: 4000,
          error: {
            duration: 6000,
          },
        }}
      />
      {children}
    </Provider>
  );
}
