import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CommitState {
  allCommits: string[];
  latestCommit: string | null;
  oldestCommit: string | null;
  selectedTable: string | undefined;
}

const initialState: CommitState = {
  allCommits: [],
  latestCommit: null,
  oldestCommit: null,
  selectedTable: "",
};

const commitSlice = createSlice({
  name: "delta",
  initialState,
  reducers: {
    setCommits: (state, action: PayloadAction<CommitState>) => {
      state.allCommits = action.payload.allCommits;
      state.latestCommit = action.payload.latestCommit;
      state.oldestCommit = action.payload.oldestCommit;
      state.selectedTable = action.payload.selectedTable;
    },
    setSelectedTable: (state, action: PayloadAction<string>) => {
      state.selectedTable = action.payload;
    },
  },
});

export const { setCommits } = commitSlice.actions;
export default commitSlice.reducer;
