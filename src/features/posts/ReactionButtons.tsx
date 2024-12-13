import { useAppDispatch } from '@/app/hooks';

import { useAddReactionMutation } from '../api/apiSlice';

import type { Post, ReactionName } from './postsSlice';
import { reactionAdded } from './postsSlice';

const reactionEmoji: Record<ReactionName, string> = {
  thumbsUp: '👍',
  tada: '🎉',
  heart: '❤️',
  rocket: '🚀',
  eyes: '👀',
};

interface ReactionButtonsProps {
  post: Post;
}

export default function ReactionButtons({ post }: ReactionButtonsProps) {
  const [addReaction] = useAddReactionMutation();

  // const dispatch = useAppDispatch(); // - RTK

  const reactionButtons = Object.entries(reactionEmoji).map(([stringName, emoji]) => {
    // Ensure TS knows this is a _specific_ string type
    const reaction = stringName as ReactionName;
    return (
      <button
        key={reaction}
        type="button"
        className="muted-button reaction-button"
        // onClick={() => dispatch(reactionAdded({ postId: post.id, reaction }))}
        onClick={() => {
          addReaction({ postId: post.id, reaction });
        }}
      >
        {emoji} {post.reactions[reaction]}
      </button>
    );
  });

  return <div>{reactionButtons}</div>;
}
