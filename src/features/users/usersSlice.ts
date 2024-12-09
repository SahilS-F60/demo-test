import { createSlice, createEntityAdapter, createSelector } from '@reduxjs/toolkit';

import { client } from '@/api/client';
import { apiSlice } from '../api/apiSlice';

import { RootState } from '@/app/store';
import { selectCurrentUsername } from '../auth/authSlice';
import { createAppAsyncThunk } from '@/app/withTypes';

export interface User {
  id: string;
  name: string;
}

const usersAdapter = createEntityAdapter<User>();
const initialState = usersAdapter.getInitialState();

export const fetchUsers = createAppAsyncThunk('fetch/users', async () => {
  const response = await client.get<User[]>('/fakeApi/users');

  return response.data;
});

/*
const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder.addCase(fetchUsers.fulfilled, usersAdapter.setAll);
  },
});

export default usersSlice.reducer;

// -- Replaced below RTK code with RTKQ query.
export const { selectAll: selectAllUsers, selectById: selectUserById } = usersAdapter.getSelectors(
  (state: RootState) => state.users,
);

export const selectCurrentUser = (state: RootState) => {
  const currentUsername = selectCurrentUsername(state);

  if (!currentUsername) return;

  return selectUserById(state, currentUsername);
};
*/

// -- RTKQ query
export const apiSliceWithUsers = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<User[], void>({
      query: () => '/users',
    }),
  }),
});

export const { useGetUsersQuery } = apiSliceWithUsers;

const emptyUsers: User[] = [];

export const selectUsersResult = apiSliceWithUsers.endpoints.getUsers.select();

export const selectAllUsers = createSelector(selectUsersResult, (usersResult) => usersResult?.data ?? emptyUsers);

export const selectUserById = createSelector(
  selectAllUsers,
  (state: RootState, userId: string) => userId,
  (user, userId) => user.find((user) => user.id === userId),
);

export const selectCurrentUser = (state: RootState) => {
  const currentUsername = selectCurrentUsername(state);
  if (currentUsername) {
    return selectUserById(state, currentUsername);
  }
};
