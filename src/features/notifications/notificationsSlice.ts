import { createAppAsyncThunk } from '@/app/withTypes';
import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';
import { client } from '@/api/client';
import type { RootState } from '@/app/store';

export interface ServerNotification {
  id: string;
  date: string;
  message: string;
  user: string;
}

export interface ClientNotification extends ServerNotification {
  read: boolean;
  isNew: boolean;
}

export const fetchNotifications = createAppAsyncThunk('notifications/fetchNotifications', async (_unused, thunkApi) => {
  const allNotifications = selectAllNotifications(thunkApi.getState());
  const [latestNotification] = allNotifications;
  const latestTimeStamp = latestNotification?.date || '';
  const response = await client.get<ServerNotification[]>(`/fakeApi/notifications?since=${latestTimeStamp}`);

  return response.data;
});

const notificationsAdapter = createEntityAdapter({
  sortComparer: (a, b) => b.date.localeCompare(a.date),
});

const initialState = notificationsAdapter.getInitialState();

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    allNotificationsRead(state) {
      Object.values(state.entities).forEach((notification) => {
        notification.read = true;
      });
    },
  },
  extraReducers(builder) {
    builder.addCase(fetchNotifications.fulfilled, (state, action) => {
      // Add client-side metadata for tracking new notifications
      const notificationsWithMetaData: ClientNotification[] = action.payload.map((notification) => ({
        ...notification,
        read: false,
        isNew: true,
      }));

      Object.values(state.entities).forEach((notification) => {
        notification.isNew = !notification.read;
      });

      notificationsAdapter.upsertMany(state, notificationsWithMetaData);
    });
  },
});

export const { allNotificationsRead } = notificationsSlice.actions;
export default notificationsSlice.reducer;

// export const selectAllNotifications = (state: RootState) => state.notifications;

export const { selectAll: selectAllNotifications } = notificationsAdapter.getSelectors(
  (state: RootState) => state.notifications,
);

export const selectUnreadNotificationsCount = (state: RootState) => {
  const allNotifications = selectAllNotifications(state);
  const unReadNotifications = allNotifications.filter((notification) => !notification.read);

  return unReadNotifications.length;
};
