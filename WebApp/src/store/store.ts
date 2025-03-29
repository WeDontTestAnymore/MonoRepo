import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../contexts/auth.slice";
import themeReducer from "../contexts/theme.slice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
