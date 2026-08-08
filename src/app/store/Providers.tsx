"use client";

import { Provider } from "react-redux";
import { store } from "./store";
import KeycloakAuthProvider from "../../components/auth/KeycloakAuthProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <KeycloakAuthProvider>
      <Provider store={store}>{children}</Provider>
    </KeycloakAuthProvider>
  );
}
