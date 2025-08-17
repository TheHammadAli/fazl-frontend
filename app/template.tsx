"use client";

import { Provider } from "react-redux";
import store from "@/store/store";
import { Toaster } from "react-hot-toast";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <Toaster
        toastOptions={{
          className: "first-letter:uppercase text-start",
        }}
      />
      {children}
    </Provider>
  );
}
