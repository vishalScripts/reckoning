import { createSlice } from "@reduxjs/toolkit";

// Load initial state from local storage
const loadState = () => {
  try {
    const storedState = localStorage.getItem("themeSettings");
    return storedState
      ? JSON.parse(storedState)
      : {
          layoutType: "normal",
          themeBackground: "",
          navbarHidden: false,
          isSidebarHidden: false,
        };
  } catch (error) {
    console.error("Error loading theme settings:", error);
    return {
      layoutType: "normal",
      themeBackground: "",
      navbarHidden: false,
      isSidebarHidden: false,
    };
  }
};

// Initial state with local storage support
const initialState = loadState();

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    changeThemeStructure: (state, action) => {
      state.layoutType = action.payload;
      localStorage.setItem("themeSettings", JSON.stringify(state));
    },
    changeBackground: (state, action) => {
      state.themeBackground = action.payload;
      localStorage.setItem("themeSettings", JSON.stringify(state));
    },
    hideNavbar: (state, action) => {
      state.navbarHidden = action.payload;
      localStorage.setItem("themeSettings", JSON.stringify(state));
    },
    toggleSidebar: (state, action) => {
      state.isSidebarHidden = action.payload;
      localStorage.setItem("themeSettings", JSON.stringify(state));
    },
  },
});

export const {
  changeThemeStructure,
  changeBackground,
  hideNavbar,
  toggleSidebar,
} = themeSlice.actions;
export default themeSlice.reducer;
