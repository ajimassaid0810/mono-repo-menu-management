import { configureStore } from "@reduxjs/toolkit";
import sidebarReducer from "./slices/sideBarSlice";
import menuReducer from "./slices/menuSlice";

export const store = configureStore({
  reducer: {
    sidebar: sidebarReducer,
    menu: menuReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
