import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface QueuedAction {
  id: string;
  type: 'like' | 'comment' | 'share';
  entityId: string;
  data?: any;
  timestamp: number;
}

export const useOfflineQueue = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queue, setQueue] = useState<QueuedAction[]>([]);

  useEffect(() => {
    // Load queue from localStorage
    const savedQueue = localStorage.getItem('offlineQueue');
    if (savedQueue) {
      setQueue(JSON.parse(savedQueue));
    }

    const handleOnline = () => {
      setIsOnline(true);
      processQueue();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const addToQueue = (action: Omit<QueuedAction, 'id' | 'timestamp'>) => {
    const queuedAction: QueuedAction = {
      ...action,
      id: `${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
    };

    const newQueue = [...queue, queuedAction];
    setQueue(newQueue);
    localStorage.setItem('offlineQueue', JSON.stringify(newQueue));

    if (isOnline) {
      processQueue();
    }
  };

  const processQueue = async () => {
    if (queue.length === 0) return;

    const currentQueue = [...queue];
    
    for (const action of currentQueue) {
      try {
        await executeAction(action);
        removeFromQueue(action.id);
      } catch (error) {
        console.error('Failed to process queued action:', error);
        // Keep in queue for retry
      }
    }
  };

  const executeAction = async (action: QueuedAction) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    switch (action.type) {
      case 'like':
        await supabase
          .from('interactions' as any)
          .insert({
            user_id: user.id,
            entity_type: 'post',
            entity_id: action.entityId,
            type: 'like',
          });
        break;
      case 'comment':
        await supabase
          .from('comments' as any)
          .insert({
            user_id: user.id,
            post_id: action.entityId,
            content: action.data?.content,
          });
        break;
      case 'share':
        // Implement share logic
        break;
    }
  };

  const removeFromQueue = (actionId: string) => {
    const newQueue = queue.filter(a => a.id !== actionId);
    setQueue(newQueue);
    localStorage.setItem('offlineQueue', JSON.stringify(newQueue));
  };

  return {
    isOnline,
    addToQueue,
    queueLength: queue.length,
  };
};

