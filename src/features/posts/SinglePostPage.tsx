import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';

import { useGetPostQuery } from '../api/apiSlice';

import { useAppSelector } from '@/app/hooks';
import { selectPostById } from './postsSlice';
import PostAuthor from './PostAuthor';
import TimeAgo from '@/components/TimeAgo';
import ReactionButtons from './ReactionButtons';
import { selectCurrentUsername } from '../auth/authSlice';
import { Spinner } from '@/components/Spinner';

export default function SinglePostPage() {
  const { postId } = useParams();

  // const post = useAppSelector((state) => selectPostById(state, postId));
  const currentUsername = useAppSelector(selectCurrentUsername);

  const { data: post, isFetching, isSuccess } = useGetPostQuery(postId!);

  const canEdit = currentUsername === post?.user;

  let content: React.ReactNode;

  if (isFetching) {
    content = <Spinner text="Loading..." />;
  } else if (isSuccess) {
    content = (
      <article className="post">
        <h2>{post.title}</h2>

        <p className="post-content">{post.content}</p>

        <PostAuthor userId={post.user} />
        <TimeAgo timestamp={post.date} />

        <ReactionButtons post={post} />

        <br />
        {canEdit && <Link to={`/editPost/${post.id}`}>Edit Post</Link>}
      </article>
    );
  }

  // if (!post) {
  //   return (
  //     <section>
  //       <h2>Post not found!</h2>
  //     </section>
  //   );
  // }

  return <section>{content}</section>;
}
