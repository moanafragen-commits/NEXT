import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

export function useNotifications(user) {
  const [permission, setPermission] = useState('default');
  const queryClient = useQueryClient();

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    }
    return 'denied';
  };

  const showNotification = (title, options) => {
    if (permission === 'granted' && 'Notification' in window) {
      new Notification(title, {
        icon: '/icon.png',
        badge: '/badge.png',
        ...options
      });
    }
  };

  useEffect(() => {
    if (!user) return;

    // Subscribe to user messages
    const unsubUserMsg = base44.entities.UserMessage.subscribe((event) => {
      if (event.type === 'create' && event.data.recipient_email === user.email) {
        queryClient.invalidateQueries({ queryKey: ['user-messages'] });
        queryClient.invalidateQueries({ queryKey: ['unread-counts'] });
        showNotification('Neue Nachricht', {
          body: event.data.content?.slice(0, 100),
          tag: `user-msg-${event.data.id}`
        });
      }
    });

    // Subscribe to group messages
    const unsubGroupMsg = base44.entities.GroupChatMessage.subscribe((event) => {
      if (event.type === 'create' && event.data.sender_id !== user.email) {
        queryClient.invalidateQueries({ queryKey: ['group-messages'] });
        queryClient.invalidateQueries({ queryKey: ['unread-counts'] });
        // Check if user is in this group before showing notification
        base44.entities.GroupChatMember.filter({
          group_id: event.data.group_id,
          member_type: 'user',
          member_id: user.email
        }).then(members => {
          if (members.length > 0) {
            showNotification('Neue Gruppennachricht', {
              body: event.data.content?.slice(0, 100),
              tag: `group-msg-${event.data.id}`
            });
          }
        });
      }
    });

    // Subscribe to character messages
    const unsubCharMsg = base44.entities.ChatMessage.subscribe((event) => {
      if (event.type === 'create' && event.data.role === 'assistant') {
        queryClient.invalidateQueries({ queryKey: ['messages'] });
        queryClient.invalidateQueries({ queryKey: ['all-messages'] });
        queryClient.invalidateQueries({ queryKey: ['unread-counts'] });
      }
    });

    return () => {
      unsubUserMsg();
      unsubGroupMsg();
      unsubCharMsg();
    };
  }, [user, permission, queryClient]);

  return { permission, requestPermission, showNotification };
}