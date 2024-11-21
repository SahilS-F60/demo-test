import { RootState } from '@/app/store';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { client } from '@/api/client';
import { createAppAsyncThunk } from '@/app/withTypes';

interface AuthState {
  username: string | null;
}

export const login = createAppAsyncThunk('auth/login', async (username: string) => {
  await client.post('/fakeApi/login', { username });
  return username;
});

export const logout = createAppAsyncThunk('auth/logout', async () => {
  await client.post('/fakeApi/logout', {});
});

const initialState: AuthState = {
  username: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(login.fulfilled, (state, action) => {
        state.username = action.payload;
      })
      .addCase(logout.fulfilled, (state) => {
        state.username = null;
      });
  },
});

export const selectCurrentUsername = (state: RootState) => state.auth.username;

export default authSlice.reducer;
