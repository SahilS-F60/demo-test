import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchPosts, selectAllPosts, selectPostsStatus, selectPostsError } from './postsSlice';
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
  const dispatch = useAppDispatch();
  const posts = useAppSelector(selectAllPosts);
  const postStatus = useAppSelector(selectPostsStatus);
  const postError = useAppSelector(selectPostsError);
  // console.log(posts);

  useEffect(() => {
    if (postStatus === 'idle') {
      dispatch(fetchPosts());
    }
  }, [postStatus, dispatch]);

  const orderedPosts = posts.slice().sort((a, b) => b.date.localeCompare(a.date));

  let content: React.ReactNode;

  if (postStatus === 'pending') {
    content = <Spinner text="Loading..." />;
  } else if (postStatus === 'succeeded') {
    const orderedPosts = posts.slice().sort((a, b) => b.date.localeCompare(a.date));

    content = orderedPosts.map((post) => <PostExcerpt key={post.id} post={post} />);
  } else if (postStatus === 'failed') {
    content = <div>{postError}</div>;
  }

  return (
    <section className="posts-list">
      <h2>Posts</h2>
      {content}
    </section>
  );
}
