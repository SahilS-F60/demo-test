import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';

import { useGetPostsQuery, Post } from '../api/apiSlice';

import PostAuthor from './PostAuthor';
import TimeAgo from '@/components/TimeAgo';
import ReactionButtons from './ReactionButtons';

import { Spinner } from '@/components/Spinner';

// ---------------------------------------------

interface PostExcerptProps {
  post: Post;
}

const PostExcerpt = ({ post }: PostExcerptProps) => {
  return (
    <article className="post-excerpt" key={post.id}>
      <h3>
        <Link to={`/posts/${post.id}`}>{post.title}</Link>
      </h3>
      <div>
        <PostAuthor userId={post.user} />
        <TimeAgo timestamp={post.date} />
      </div>
      <p className="post-content">{post.content.substring(0, 100)}</p>
      <ReactionButtons post={post} />
    </article>
  );
};

export default function PostsList() {
  // Calling the `useGetPostsQuery()` hook automatically fetches data!
  const { data: posts = [], isLoading, isSuccess, isError, error } = useGetPostsQuery();

  const sortedPosts = useMemo(() => {
    const sortedPosts = posts.slice();
    sortedPosts.sort((a, b) => b.date.localeCompare(a.date));
    return sortedPosts;
  }, [posts]);

  let content: React.ReactNode;

  if (isLoading) {
    content = <Spinner text="Loading..." />;
  } else if (isSuccess) {
    content = sortedPosts.map((post) => <PostExcerpt key={post.id} post={post} />);
  } else if (isError) {
    content = <div>{error.toString()}</div>;
  }

  return (
    <section className="posts-list">
      <h2>Posts</h2>
      {content}
    </section>
  );
}
