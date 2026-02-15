import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

const DEFAULT_SETTINGS = {
  direct_messages: true,
  group_messages: true,
  character_messages: true,
  new_posts: true,
  comments: true,
  likes: true,
  status_updates: true,
  sound_enabled: true,
  quiet_hours_enabled: false,
  quiet_hours_start: '22:00',
  quiet_hours_end: '08:00'
};

function isQuietHours(settings) {
  if (!settings.quiet_hours_enabled) return false;
  
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  
  const [startH, startM] = settings.quiet_hours_start.split(':').map(Number);
  const [endH, endM] = settings.quiet_hours_end.split(':').map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;
  
  if (startMinutes <= endMinutes) {
    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  }
  // Overnight range (e.g. 22:00 - 08:00)
  return currentMinutes >= startMinutes || currentMinutes < endMinutes;
}

export function useNotifications(user) {
  const [permission, setPermission] = useState('default');
  const queryClient = useQueryClient();

  const getSettings = () => {
    return { ...DEFAULT_SETTINGS, ...(user?.notification_settings || {}) };
  };

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
    const settings = getSettings();
    if (isQuietHours(settings)) return;
    
    if (permission === 'granted' && 'Notification' in window) {
      new Notification(title, {
        icon: '/icon.png',
        badge: '/badge.png',
        silent: !settings.sound_enabled,
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
        
        const settings = getSettings();
        if (settings.direct_messages) {
          showNotification('Neue Nachricht', {
            body: event.data.content?.slice(0, 100),
            tag: `user-msg-${event.data.id}`
          });
        }
      }
    });

    // Subscribe to group messages
    const unsubGroupMsg = base44.entities.GroupChatMessage.subscribe((event) => {
      if (event.type === 'create' && event.data.sender_id !== user.email) {
        queryClient.invalidateQueries({ queryKey: ['group-messages'] });
        queryClient.invalidateQueries({ queryKey: ['unread-counts'] });
        
        const settings = getSettings();
        if (settings.group_messages) {
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
      }
    });

    // Subscribe to character messages
    const unsubCharMsg = base44.entities.ChatMessage.subscribe((event) => {
      if (event.type === 'create' && event.data.role === 'assistant') {
        queryClient.invalidateQueries({ queryKey: ['messages'] });
        queryClient.invalidateQueries({ queryKey: ['all-messages'] });
        queryClient.invalidateQueries({ queryKey: ['unread-counts'] });
        
        const settings = getSettings();
        if (settings.character_messages) {
          showNotification('Neue Charakter-Antwort', {
            body: event.data.content?.slice(0, 100),
            tag: `char-msg-${event.data.id}`
          });
        }
      }
    });

    // Subscribe to new posts
    const unsubPosts = base44.entities.Post.subscribe((event) => {
      if (event.type === 'create') {
        queryClient.invalidateQueries({ queryKey: ['posts'] });
        
        const settings = getSettings();
        if (settings.new_posts) {
          showNotification('Neuer Post', {
            body: event.data.content?.slice(0, 100),
            tag: `post-${event.data.id}`
          });
        }
      }
    });

    // Subscribe to comments
    const unsubComments = base44.entities.Comment.subscribe((event) => {
      if (event.type === 'create') {
        queryClient.invalidateQueries({ queryKey: ['comments'] });
        
        const settings = getSettings();
        if (settings.comments) {
          showNotification('Neuer Kommentar', {
            body: event.data.content?.slice(0, 100),
            tag: `comment-${event.data.id}`
          });
        }
      }
    });

    // Subscribe to likes
    const unsubLikes = base44.entities.PostLike.subscribe((event) => {
      if (event.type === 'create') {
        queryClient.invalidateQueries({ queryKey: ['likes'] });
        
        const settings = getSettings();
        if (settings.likes) {
          showNotification('Neuer Like', {
            body: 'Jemand hat deinen Beitrag geliked ❤️',
            tag: `like-${event.data.id}`
          });
        }
      }
    });

    // Subscribe to status updates
    const unsubStatus = base44.entities.UserStatus.subscribe((event) => {
      if (event.type === 'create' && event.data.user_email !== user.email) {
        queryClient.invalidateQueries({ queryKey: ['user-statuses'] });
        
        const settings = getSettings();
        if (settings.status_updates) {
          showNotification('Neues Status-Update', {
            body: event.data.caption || 'Ein neuer Status wurde geteilt',
            tag: `status-${event.data.id}`
          });
        }
      }
    });

    return () => {
      unsubUserMsg();
      unsubGroupMsg();
      unsubCharMsg();
      unsubPosts();
      unsubComments();
      unsubLikes();
      unsubStatus();
    };
  }, [user, permission, queryClient]);

  return { permission, requestPermission, showNotification };
}