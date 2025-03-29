import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CommitState {
  allCommits: string[];
  latestCommit: string | null;
  oldestCommit: string | null;
}

const initialState: CommitState = {
  allCommits: [],
  latestCommit: null,
  oldestCommit: null,
};

const commitSlice = createSlice({
  name: "delta",
  initialState,
  reducers: {
    setCommits: (state, action: PayloadAction<CommitState>) => {
      state.allCommits = action.payload.allCommits;
      state.latestCommit = action.payload.latestCommit;
      state.oldestCommit = action.payload.oldestCommit;
    },
  },
});

export const { setCommits } = commitSlice.actions;
export default commitSlice.reducer;
