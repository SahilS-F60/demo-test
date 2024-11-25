import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import PostAuthor from './PostAuthor';
import TimeAgo from '@/components/TimeAgo';
import ReactionButtons from './ReactionButtons';
import { fetchPosts, selectPostById, selectPostIds, selectPostsStatus, selectPostsError } from './postsSlice';

import { Spinner } from '@/components/Spinner';
import { useSelector } from 'react-redux';

// ---------------------------------------------

interface PostExcerptProps {
  postId: string;
}

const PostExcerpt = ({ postId }: PostExcerptProps) => {
  const post = useAppSelector((state) => selectPostById(state, postId));

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
  const orderedPostIds = useSelector(selectPostIds);

  const postStatus = useSelector(selectPostsStatus);
  const postError = useSelector(selectPostsError);

  useEffect(() => {
    if (postStatus === 'idle') {
      dispatch(fetchPosts());
    }
  }, [postStatus, dispatch]);

  let content: React.ReactNode;

  if (postStatus === 'pending') {
    content = <Spinner text="Loading..." />;
  } else if (postStatus === 'succeeded') {
    content = orderedPostIds.map((postId) => <PostExcerpt key={postId} postId={postId} />);
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
