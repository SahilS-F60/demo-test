import { Link, useParams } from 'react-router-dom';
import { createSelector } from '@reduxjs/toolkit';
import type { TypedUseQueryStateResult } from '@reduxjs/toolkit/query/react';

import { useAppSelector } from '@/app/hooks';
import { selectPostsByUser } from '../posts/postsSlice';

import { useGetPostsQuery, Post } from '../api/apiSlice';

import { selectUserById } from './usersSlice';

// Create a TS type that represents "the result value passed
// into the `selectFromResult` function for this hook"
type GetPostSelectFromResultArg = TypedUseQueryStateResult<Post[], any, any>;

const selectPostsForUser = createSelector(
  (res: GetPostSelectFromResultArg) => res.data,
  (res: GetPostSelectFromResultArg, userId: string) => userId,
  (data, userId) => data?.filter((post) => post.user === userId),
);

export default function UserPage() {
  const { userId } = useParams();

  // - RTK
  const user = useAppSelector((state) => selectUserById(state, userId));
  // const postsForUser = useAppSelector((state) => selectPostsByUser(state, userId));

  // - RTKQ
  const { postsForUser } = useGetPostsQuery(undefined, {
    selectFromResult: (result) => ({
      ...result,
      postsForUser: selectPostsForUser(result, userId!),
    }),
  });

  if (!user) {
    return (
      <section>
        <h2>User not found!</h2>
      </section>
    );
  }

  const postTitles = postsForUser?.map((post) => (
    <li key={post.id}>
      <Link to={`/posts/${post.id}`}>{post.title}</Link>
    </li>
  ));

  return (
    <section>
      <h2>{user.name}</h2>

      <ul>{postTitles}</ul>
    </section>
  );
}
