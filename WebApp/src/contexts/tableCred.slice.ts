import { createSlice, PayloadAction } from "@reduxjs/toolkit";

enum TableTypes {
  DELTA = "DELTA",
  ICEBERG = "ICEBERG",
  HUDI = "HUDI",
  PARQUET = "PARQUET",
}

interface TableCred {
  type: TableTypes;
  path: string;
}

interface TableState {
  tableCred: TableCred[] | null;
  basePath: string | null;
}

const initialState: TableState = {
  tableCred: null,
  basePath: null,
};

const tableCredSlice = createSlice({
  name: "tableCred",
  initialState,
  reducers: {
    setTableCred: (state, action: PayloadAction<TableCred[]>) => {
      state.tableCred = action.payload;
    },
    setBasePath: (state, action: PayloadAction<string>) => {
      state.basePath = action.payload;
    },
    addTableCred: (state, action: PayloadAction<TableCred>) => {
      if (state.tableCred) {
        state.tableCred.push(action.payload);
      } else {
        state.tableCred = [action.payload];
      }
    },
    removeTableCred: (state, action: PayloadAction<string>) => {
      if (state.tableCred) {
        state.tableCred = state.tableCred.filter(
          (cred) => cred.path !== action.payload
        );
      }
    },
    clearTableCred: (state) => {
      state.tableCred = null;
    },
  },
});

export const {
  setTableCred,
  setBasePath,
  addTableCred,
  removeTableCred,
  clearTableCred,
} = tableCredSlice.actions;

export default tableCredSlice.reducer;
