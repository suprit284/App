// hooks/useWebSocketManager.ts
import { useWebSocket } from '@/contexts/WebSocketContext';
import { useStatusStore } from '@/stores/statusStore';
import { useEffect } from 'react';


export const useWebSocketManager = () => {
  const { connect, disconnect, isConnected } = useWebSocket();
  const setWsConnectionStatus = useStatusStore((state) => state.setWsConnectionStatus);
  
  useEffect(() => {
    // Update store when WebSocket connection status changes
    setWsConnectionStatus(isConnected ? 'connected' : 'disconnected');
  }, [isConnected]);
  
  return { connect, disconnect, isConnected };
};