import { useLayoutEffect } from 'react';
import classNames from 'classnames';

import { useAppDispatch, useAppSelector } from '@/app/hooks';
import TimeAgo from '../../components/TimeAgo';
import PostAuthor from '../posts/PostAuthor';
import { allNotificationsRead, selectMetadataEntities, useGetNotificationsQuery } from './notificationsSlice';

export default function NotificationsList() {
  const dispatch = useAppDispatch();
  const { data: notifications = [] } = useGetNotificationsQuery();
  const notificationsMetadata = useAppSelector(selectMetadataEntities);

  useLayoutEffect(() => {
    dispatch(allNotificationsRead());
  });

  const renderedNotifications = notifications.map((notification) => {
    // Get the metadata object matching this notification
    const metadata = notificationsMetadata[notification.id];
    const notificationClassname = classNames('notification', {
      // re-enable the `isNew` check for styling
      new: metadata.isNew,
    });

    return (
      <div key={notification.id} className={notificationClassname}>
        <div>
          <b>
            <PostAuthor userId={notification.user} showPrefix={false} />
          </b>{' '}
          {notification.message}
        </div>
        <TimeAgo timestamp={notification.date} />
      </div>
    );
  });

  return (
    <section className="notificationsList">
      <h2>Notifications</h2>
      {renderedNotifications}
    </section>
  );
}
