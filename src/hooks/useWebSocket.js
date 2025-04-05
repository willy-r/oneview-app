import { useEffect, useRef } from 'react';

export function useWebSocket(userId, onMessage) {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!userId) return;

    const socket = new WebSocket(`${process.env.EXPO_PUBLIC_WS_BASE}/ws/${userId}`);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log('[WebSocket] Conectado');
    };

    socket.onmessage = (e) => {
      const data = e.data;
      console.log('[WebSocket] Mensagem recebida:', data);
      onMessage(data);
    };

    socket.onerror = (e) => {
      console.error('[WebSocket] Erro:', e.message);
    };

    socket.onclose = (e) => {
      console.log('[WebSocket] Conexão encerrada', e.code, e.reason);
    };

    return () => {
      socket.close();
    };
  }, [userId]);
}
