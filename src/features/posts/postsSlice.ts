import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';
import { sub } from 'date-fns';
import { client } from '@/api/client';

import { RootState } from '@/app/store';
import { logout } from '../auth/authSlice';
import { createAppAsyncThunk } from '@/app/withTypes';

// -----------------------------------------------
export interface Reactions {
  thumbsUp: number;
  tada: number;
  heart: number;
  rocket: number;
  eyes: number;
}

export type ReactionName = keyof Reactions;

// Define a TS type for the data we'll be using
export interface Post {
  id: string;
  title: string;
  content: string;
  user: string;
  reactions: Reactions;
}

type PostUpdate = Pick<Post, 'id' | 'title' | 'content'>;
type NewPost = Pick<Post, 'title' | 'content' | 'user'>;

const initialReactions: Reactions = {
  thumbsUp: 0,
  tada: 0,
  heart: 0,
  rocket: 0,
  eyes: 0,
};

interface PostsState {
  posts: Post[];
  status: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: string | null;
}

export const fetchPosts = createAppAsyncThunk(
  'posts/fetchPosts',
  async () => {
    const response = await client.get<Post[]>('/fakeApi/posts');
    return response.data;
  },
  {
    condition(arg, thunkApi) {
      const postStatus = selectPostsStatus(thunkApi.getState());
      if (postStatus !== 'idle') {
        return false;
      }
    },
  },
);

export const addNewPost = createAppAsyncThunk(
  'posts/addNewPost',
  // The payload creator receives the partial `{title, content, user}` object
  async (initialPost: NewPost) => {
    // We send the initial data to the fake API server
    const response = await client.post<Post>('/fakeApi/posts', initialPost);
    // The response includes the complete post object, including unique ID
    return response.data;
  },
);

const initialState: PostsState = {
  posts: [],
  status: 'idle',
  error: null,
};

// Create the slice and pass in the initial state
const postsSlice = createSlice({
  name: 'posts',
  initialState,
  // -- Reducers
  reducers: {
    // 1)

    // 2)
    postUpdated(state, action: PayloadAction<PostUpdate>) {
      const { id, title, content } = action.payload;
      const existingPost = state.posts.find((post) => post.id === id);
      if (existingPost) {
        existingPost.title = title;
        existingPost.content = content;
      }
    },
    // 3)
    reactionAdded(state, action: PayloadAction<{ postId: string; reaction: ReactionName }>) {
      const { postId, reaction } = action.payload;
      const existingPost = state.posts.find((post) => post.id === postId);

      if (existingPost) {
        existingPost.reactions[reaction]++;
      }
    },
  },
  // -- Extra-Reducers
  extraReducers: (builder) => {
    builder
      .addCase(logout.fulfilled, (state) => initialState)
      .addCase(fetchPosts.pending, (state, action) => {
        state.status = 'pending';
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Add any fetched posts to the array
        state.posts.push(...action.payload);
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Unknown error';
      })
      .addCase(addNewPost.fulfilled, (state, action) => {
        // We can directly add the new post object to our posts array
        state.posts.push(action.payload);
      });
  },
});

// - Export the auto-generated action creator with the same name
export const { postUpdated, reactionAdded } = postsSlice.actions;

// - Export the generated reducer function
export default postsSlice.reducer;

// - Export the selectors
export const selectAllPosts = (state: RootState) => state.posts.posts;

export const selectPostById = (state: RootState, postId: string) =>
  state.posts.posts.find((post) => post.id === postId);

// export const selectPostsByUser = (state: RootState, userId: string) => {
//   const allPosts = selectAllPosts(state);
//   // ❌ This seems suspicious! See more details below
//   return allPosts.filter((post) => post.user === userId);
// };

export const selectPostsByUser = createSelector(
  // Pass in one or more "input selectors"
  [
    // we can pass in an existing selector function that
    // reads something from the root `state` and returns it
    selectAllPosts,
    // and another function that extracts one of the arguments
    // and passes that onward
    (state: RootState, userId: string) => userId,
  ],
  (state, userId) => state.filter((post) => post.user === userId),
);

export const selectPostsStatus = (state: RootState) => state.posts.status;

export const selectPostsError = (state: RootState) => state.posts.error;
