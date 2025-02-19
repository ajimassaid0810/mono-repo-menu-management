import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

interface MenuItem {
  title: string;
  icon: string;
  highlight?: boolean;
  children?: MenuItem[];
}

interface SidebarState {
  isSidebarOpen: boolean;
  openMenus: Record<string, boolean>;
  menuItems: MenuItem[];
  loading: boolean;
  error: string | null;
}

// Fetch data dari API (sementara hardcoded)
export const fetchMenuItems = createAsyncThunk("sidebar/fetchMenuItems", async () => {
  const response = [
    {
      title: "Systems",
      icon: "/icons/menu.png",
      highlight: false,
      children: [
        { title: "System Code", icon: "/icons/submenu.png", highlight: false },
        { title: "Properties", icon: "/icons/submenu.png", highlight: false },
        { title: "Menus", icon: "/icons/submenu.png", highlight: false }, 
        { title: "API List", icon: "/icons/submenu.png", highlight: false },
      ],
    },
    {
      title: "Users & Group",
      icon: "/icons/menu.png",
      highlight: false,
      
    },
  ];
  return response;
});

const initialState: SidebarState = {
  isSidebarOpen: true,
  openMenus: {},
  menuItems: [],
  loading: false,
  error: null,
};

const sidebarSlice = createSlice({
  name: "sidebar",
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    toggleMenu: (state, action: PayloadAction<string>) => {
      state.openMenus[action.payload] = !state.openMenus[action.payload];
    },
    setHighlightedMenu: (state, action: PayloadAction<string>) => {
      state.menuItems.forEach((menu) => {
        if (menu.children) {
          menu.children.forEach((child) => {
            child.highlight = child.title === action.payload;
          });

          // Buka parent jika ada child yang dipilih
          state.openMenus[menu.title] = menu.children.some((child) => child.highlight);
        }
      });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMenuItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMenuItems.fulfilled, (state, action: PayloadAction<MenuItem[]>) => {
        state.loading = false;
        state.menuItems = action.payload;
        sidebarSlice.caseReducers.setHighlightedMenu(state, {
            payload: "Menus",
            type: ""
        }); // Default aktif di "Menus"
      })
      .addCase(fetchMenuItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to load menu items";
      });
  },
});

export const { toggleSidebar, toggleMenu, setHighlightedMenu } = sidebarSlice.actions;
export default sidebarSlice.reducer;
