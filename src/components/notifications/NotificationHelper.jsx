import { base44 } from '@/api/base44Client';

/**
 * Creates a notification record.
 */
export async function createNotification({
  recipientEmail,
  type,
  actorName,
  actorAvatar,
  actorUsername,
  postId,
  postPreview,
  messagePreview
}) {
  if (!recipientEmail) return;
  
  await base44.entities.Notification.create({
    recipient_email: recipientEmail,
    type,
    actor_name: actorName || 'Jemand',
    actor_avatar: actorAvatar || '',
    actor_username: actorUsername || '',
    post_id: postId || '',
    post_preview: postPreview ? postPreview.slice(0, 100) : '',
    message_preview: messagePreview ? messagePreview.slice(0, 100) : '',
    is_read: false
  });
}