import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../contexts/auth.slice";
import themeReducer from "../contexts/theme.slice";
import tableCredReducer from "../contexts/tableCred.slice";
import deltaReducer from "../contexts/delta.slice";
import parquetReducer from "../contexts/parquet.slice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
    tableCred: tableCredReducer,
    delta: deltaReducer,
    parquet: parquetReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
