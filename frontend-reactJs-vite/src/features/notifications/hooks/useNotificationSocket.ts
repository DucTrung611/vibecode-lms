import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';
import { useAuthStore } from '@/shared/stores/auth.store';
import type { Notification } from '../types/notification.types';

function getRealtimeUrl(): string {
  return `${new URL(import.meta.env.VITE_API_BASE_URL).origin}/realtime`;
}

export function useNotificationSocket() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    const socket = io(getRealtimeUrl(), {
      query: { token: accessToken },
      transports: ['websocket'],
    });

    socket.on('notification.new', (notification: Notification) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast(notification.title);
    });

    return () => {
      socket.disconnect();
    };
  }, [accessToken, queryClient]);
}
