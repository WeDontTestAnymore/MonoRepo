import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ParquetState {
  directoryPath: string | null;
  files: string[] | null;
}

interface ParquetInfo {
  info: ParquetState[] | null;
}

const initialState: ParquetInfo = {
  info: null,
};

const parquetSlice = createSlice({
  name: "parquetInfo",
  initialState,
  reducers: {
    setParquetInfo(state, action: PayloadAction<ParquetState[]>) {
      state.info = action.payload;
    },
    clearParquetInfo(state) {
      state.info = null;
    },
  },
});

export const { setParquetInfo, clearParquetInfo } = parquetSlice.actions;
export default parquetSlice.reducer;
