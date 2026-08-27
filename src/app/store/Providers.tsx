"use client";

import { useEffect } from "react";
import { Provider } from "react-redux";
import { setupListeners } from "@reduxjs/toolkit/query";

import { store } from "./store";

export default function Providers({ children }: { children: React.ReactNode }) {
  // Enables RTK Query's refetchOnFocus / refetchOnReconnect behaviour.
  useEffect(() => setupListeners(store.dispatch), []);

  return <Provider store={store}>{children}</Provider>;
}
