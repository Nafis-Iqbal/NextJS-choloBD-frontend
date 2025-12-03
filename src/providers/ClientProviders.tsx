/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { ReactNode} from "react";
import { Provider } from "react-redux";
import store from "@/global-state-context/globalStateStore";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient } from "@/services/apiInstance";
import GlobalDataLoader from "./GlobalDataLoader";

export function ClientProviders({ children }: { children: ReactNode }) {
  
  return (
    <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <GlobalDataLoader/>
          {/* <ReactQueryDevtools initialIsOpen={true}/> */}
          {children}
        </Provider>
    </QueryClientProvider>
  );
}
