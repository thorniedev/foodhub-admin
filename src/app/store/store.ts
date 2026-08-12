// import { configureStore } from "@reduxjs/toolkit";
// import { baseApi } from "./baseApi";
// import { adminBaseApi } from "./adminBaseApi";

// export const store = configureStore({
//   reducer: {
//     [baseApi.reducerPath]: baseApi.reducer,
//     [adminBaseApi.reducerPath]: adminBaseApi.reducer,
//   },
//   middleware: (getDefaultMiddleware) =>
//     getDefaultMiddleware()
//       .concat(baseApi.middleware)
//       .concat(adminBaseApi.middleware),
// });

// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;



// import { configureStore } from "@reduxjs/toolkit";

// import { baseApi } from "./baseApi";
// import { adminBaseApi } from "./adminBaseApi";
// import { catalogBaseApi } from "./catalogBaseApi";

// export const store = configureStore({
//   reducer: {
//     [baseApi.reducerPath]: baseApi.reducer,
//     [adminBaseApi.reducerPath]: adminBaseApi.reducer,
//     [catalogBaseApi.reducerPath]: catalogBaseApi.reducer,
//   },

//   middleware: (getDefaultMiddleware) =>
//     getDefaultMiddleware()
//       .concat(baseApi.middleware)
//       .concat(adminBaseApi.middleware)
//       .concat(catalogBaseApi.middleware),
// });

// export type RootState = ReturnType<typeof store.getState>;

// export type AppDispatch = typeof store.dispatch;


import {
  configureStore,
} from "@reduxjs/toolkit";

import {
  baseApi,
} from "./baseApi";

import {
  adminBaseApi,
} from "./adminBaseApi";

import {
  catalogBaseApi,
} from "./catalogBaseApi";

export const store =
  configureStore({
    reducer: {
      [baseApi.reducerPath]:
        baseApi.reducer,

      [adminBaseApi.reducerPath]:
        adminBaseApi.reducer,

      [catalogBaseApi.reducerPath]:
        catalogBaseApi.reducer,
    },

    middleware: (
      getDefaultMiddleware,
    ) =>
      getDefaultMiddleware()
        .concat(
          baseApi.middleware,
        )
        .concat(
          adminBaseApi.middleware,
        )
        .concat(
          catalogBaseApi.middleware,
        ),
  });

export type RootState =
  ReturnType<
    typeof store.getState
  >;

export type AppDispatch =
  typeof store.dispatch;