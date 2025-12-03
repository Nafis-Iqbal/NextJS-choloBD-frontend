import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the initial state type
export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user_id: number | null;
}

// Initial state
const initialState: AuthState = {
  isAuthenticated: false,
  token: null,
  user_id: null,
};

// Create a slice for authentication
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (state, action: PayloadAction<{ user_id: number; token: string }>) => {
      state.isAuthenticated = true;
      state.user_id = action.payload.user_id;
      state.token = action.payload.token;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user_id = null;
      state.token = null;
      sessionStorage.removeItem('auth_token');
      sessionStorage.removeItem('user_name');
      sessionStorage.setItem('isAuthenticated', "false");
    },
  },
});

// Export actions
export const { setAuth, logout } = authSlice.actions;
export const authReducer = authSlice.reducer;

