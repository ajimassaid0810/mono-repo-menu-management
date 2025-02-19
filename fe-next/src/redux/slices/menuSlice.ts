import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export interface MenuItem {
  id: string;
  name: string;
  parentId: string | null;
  depth: number;
  order: number;
  createdAt: string;
  updatedAt: string;
  children: MenuItem[];
}

interface MenuState {
  menuHierarchy: MenuItem[];
  menus: MenuItem[];
  selectedMenu: MenuItem | null;
  expandedNodes: Record<string, boolean>;
  loading: boolean;
  error: string | null;
}
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:4019";

export const fetchMenuHierarchy = createAsyncThunk("menu/fetchHierarchy", async () => {
  const response = await axios.get(`${API_BASE_URL}/menus/hierarchy`);
  return response.data.data;
});

export const fetchMenus = createAsyncThunk("menu/fetchMenus", async () => {
  const response = await axios.get(`${API_BASE_URL}/menus`);
  return response.data.data;
});

export const getMenusById = createAsyncThunk("menu/getById", async (id: string) => {
  const response = await axios.get(`${API_BASE_URL}/menus/${id}`);
  return response.data.data;
});

export const updateMenuById = createAsyncThunk("menu/updateById", async ({ id, data }: { id: string; data: Partial<MenuItem> }) => {
  const response = await axios.patch(`${API_BASE_URL}/menus/${id}`, data);
  return response.data.data;
});

export const createMenu = createAsyncThunk("menu/create", async ({ data }: { data: Partial<MenuItem> }) => {
  const response = await axios.post(`${API_BASE_URL}/menus`, data);
  return response.data.data;
});

export const deleteMenu = createAsyncThunk("menu/delete", async ({ id, cascade }: { id: string; cascade: boolean }) => {
  const response = await axios.delete(`${API_BASE_URL}/menus/${id}?cascade=${cascade}`);
  return response.data.data;
});


const initialState: MenuState = {
  menuHierarchy: [],
  menus:[],
  selectedMenu: null,
  expandedNodes: {},
  loading: false,
  error: null,
};

const menuSlice = createSlice({
  name: "menu",
  initialState,
  reducers: {
    toggleNode: (state, action) => {
      const nodeId = action.payload;
      state.expandedNodes[nodeId] = !state.expandedNodes[nodeId];
    },
    expandAll: (state) => {
      const expandAllNodes = (nodes: MenuItem[]) => {
        let expandedState: Record<string, boolean> = {};
        nodes.forEach((node) => {
          expandedState[node.id] = true;
          if (node.children) {
            expandedState = { ...expandedState, ...expandAllNodes(node.children) };
          }
        });
        return expandedState;
      };
      state.expandedNodes = expandAllNodes(state.menuHierarchy);
    },
    collapseAll: (state) => {
      state.expandedNodes = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMenuHierarchy.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMenuHierarchy.fulfilled, (state, action) => {
        const sortMenuHierarchy = (menu: MenuItem): MenuItem => {
          if (!menu.children || menu.children.length === 0) return menu;
          return {
            ...menu,
            children: [...menu.children]
              .sort((a, b) => a.order - b.order)
              .map(sortMenuHierarchy),
          };
        };
      
        state.menuHierarchy = action.payload.map(sortMenuHierarchy);
        state.loading = false;
      })
      .addCase(fetchMenuHierarchy.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch menu hierarchy";
      })
      .addCase(fetchMenus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMenus.fulfilled, (state, action) => {
        state.menus = action.payload;
        state.loading = false;
      })
      .addCase(fetchMenus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch menu hierarchy";
      })
      .addCase(getMenusById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMenusById.fulfilled, (state, action) => {
        state.selectedMenu = action.payload;
        state.loading = false;
      })
      .addCase(getMenusById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch menu by ID";
      })
      .addCase(createMenu.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createMenu.fulfilled, (state, action) => {
        state.selectedMenu = action.payload;
        state.loading = false;
      })
      .addCase(createMenu.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to Create menu";
      })
      .addCase(updateMenuById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMenuById.fulfilled, (state, action) => {
        state.selectedMenu = action.payload;
        state.loading = false;
      })
      .addCase(updateMenuById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to update menu";
      })
      .addCase(deleteMenu.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMenu.fulfilled, (state, action) => {
        state.selectedMenu = action.payload;
        state.loading = false;
      })
      .addCase(deleteMenu.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to Delete menu";
      });
  },
});

export const { toggleNode, expandAll, collapseAll } = menuSlice.actions;
export default menuSlice.reducer;
