import { time, timeStamp } from 'console';
import { parseISO, formatDistanceToNow } from 'date-fns';

interface TimeAgoProps {
  timestamp: string;
}

export default function TimeAgo({ timestamp }: TimeAgoProps) {
  let timeAgo = '';
  if (timestamp) {
    const date = parseISO(timestamp);
    const timePeriod = formatDistanceToNow(date);
    timeAgo = `${timePeriod} ago`;
  }

  return (
    <time datetime={timestamp} title={timestamp}>
      &nbsp; <i>{timeAgo}</i>
    </time>
  );
}
