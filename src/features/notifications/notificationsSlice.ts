import { createSlice, createEntityAdapter, createSelector, createAction, isAnyOf } from '@reduxjs/toolkit';

import { client } from '@/api/client';
import { forceGenerateNotifications } from '@/api/server';

import type { AppThunk, RootState } from '@/app/store';
import { createAppAsyncThunk } from '@/app/withTypes';

import { apiSlice } from '../api/apiSlice';

export interface ServerNotification {
  id: string;
  date: string;
  message: string;
  user: string;
}

// export interface ClientNotification extends ServerNotification {
//   read: boolean;
//   isNew: boolean;
// }

// Replaces `ClientNotification`, since we just need these fields
export interface NotificationMetadata {
  // Add an `id` field, since this is now a standalone object
  id: string;
  read: boolean;
  isNew: boolean;
}

export const fetchNotifications = createAppAsyncThunk('notifications/fetchNotifications', async (_unused, thunkApi) => {
  const allNotifications = selectAllNotificationsMetadata(thunkApi.getState());
  const [latestNotification] = allNotifications;
  // Deleted timestamp lookups - we're about to remove this thunk anyway
  const response = await client.get<ServerNotification[]>(`/fakeApi/notifications`);
  return response.data;
});

// Renamed from `notificationsAdapter`, and we don't need sorting
const metadataAdapter = createEntityAdapter<NotificationMetadata>();

const initialState = metadataAdapter.getInitialState();

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    allNotificationsRead(state) {
      // Rename to `metadata`
      Object.values(state.entities).forEach((metadata) => {
        metadata.read = true;
      });
    },
  },
  extraReducers(builder) {
    // Listen for the endpoint `matchFulfilled` action with `addMatcher`
    builder.addMatcher(matchNotificationsReceived, (state, action) => {
      // Add client-side metadata for tracking new notifications
      const notificationsMetadata: NotificationMetadata[] = action.payload.map((notification) => ({
        // Give the metadata object the same ID as the notification
        id: notification.id,
        read: false,
        isNew: true,
      }));

      // Rename to `metadata`
      Object.values(state.entities).forEach((metadata) => {
        // Any notifications we've read are no longer new
        metadata.isNew = !metadata.read;
      });

      metadataAdapter.upsertMany(state, notificationsMetadata);
    });
  },
});

export const { allNotificationsRead } = notificationsSlice.actions;
export default notificationsSlice.reducer;

export const { selectAll: selectAllNotificationsMetadata, selectEntities: selectMetadataEntities } =
  metadataAdapter.getSelectors((state: RootState) => state.notifications);

export const selectUnreadNotificationsCount = (state: RootState) => {
  const allMetadata = selectAllNotificationsMetadata(state);
  const unReadNotifications = allMetadata.filter((metadata) => !metadata.read);

  return unReadNotifications.length;
};

// -- RTKQ --
const notificationsReceived = createAction<ServerNotification[]>('notifications/notificationsReceived');

export const apiSliceWithNotifications = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<ServerNotification[], void>({
      query: () => '/notifications',
      async onCacheEntryAdded(arg, lifecycleApi) {
        const ws = new WebSocket('ws://localhost');
        try {
          await lifecycleApi.cacheDataLoaded;

          const listner = (event: MessageEvent<string>) => {
            const message: {
              type: 'notifications';
              payload: ServerNotification[];
            } = JSON.parse(event.data);
            switch (message.type) {
              case 'notifications': {
                lifecycleApi.updateCachedData((draft) => {
                  // Insert all received notifications from the websocket
                  // into the existing RTKQ cache array
                  draft.push(...message.payload);
                  draft.sort((a, b) => b.date.localeCompare(a.date));
                });

                // Dispatch an additional action so we can track "read" state
                lifecycleApi.dispatch(notificationsReceived(message.payload));
                break;
              }
              default:
                break;
            }
          };
          ws.addEventListener('message', listner);
        } catch {
          // no-op in case `cacheEntryRemoved` resolves before `cacheDataLoaded`,
          // in which case `cacheDataLoaded` will throw
        }
        // cacheEntryRemoved will resolve when the cache subscription is no longer active
        await lifecycleApi.cacheEntryRemoved;
        // perform cleanup steps once the `cacheEntryRemoved` promise resolves
        ws.close();
      },
    }),
  }),
});

export const { useGetNotificationsQuery } = apiSliceWithNotifications;

const matchNotificationsReceived = isAnyOf(
  notificationsReceived,
  apiSliceWithNotifications.endpoints.getNotifications.matchFulfilled,
);

export const fetchNotificationsWebsocket = (): AppThunk => (dispatch, getState) => {
  const allNotifications = selectNotificationsData(getState());
  const [latestNotification] = allNotifications;
  const latestTimestamp = latestNotification?.date ?? '';
  // Hardcode a call to the mock server to simulate a server push scenario over websockets
  forceGenerateNotifications(latestTimestamp);
};

const emptyNotifications: ServerNotification[] = [];

export const selectNotificationsResult = apiSliceWithNotifications.endpoints.getNotifications.select();

const selectNotificationsData = createSelector(
  selectNotificationsResult,
  (notificationsResult) => notificationsResult.data ?? emptyNotifications,
);
