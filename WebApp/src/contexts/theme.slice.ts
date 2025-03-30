import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the initial state for the theme slice
interface ThemeState {
  theme: "light" | "dark";
}

const initialState: ThemeState = {
  theme: "light", // Default theme
};

// Create a slice for managing the theme
const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    toggleTheme(state) {
      // Toggle the theme between light and dark
      state.theme = state.theme === "light" ? "dark" : "light";
    },
    setTheme(state, action: PayloadAction<"light" | "dark">) {
      // Set the theme based on the provided value
      state.theme = action.payload;
    },
  },
});

// Export the actions and reducer
export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
