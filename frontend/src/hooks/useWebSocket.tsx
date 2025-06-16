import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { WebSocketMessage, WebSocketState } from '@/types';

interface WebSocketContextType extends WebSocketState {
  sendMessage: (message: WebSocketMessage) => void;
  connect: () => void;
  disconnect: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

interface WebSocketProviderProps {
  children: ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const [state, setState] = useState<WebSocketState>({
    isConnected: false,
    isConnecting: false,
    error: null,
    lastMessage: null,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:3001';

  const connect = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        setState(prev => ({
          ...prev,
          isConnected: true,
          isConnecting: false,
          error: null,
        }));
        reconnectAttempts.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setState(prev => ({
            ...prev,
            lastMessage: message,
          }));
          
          // Handle specific message types
          handleMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setState(prev => ({
          ...prev,
          isConnected: false,
          isConnecting: false,
        }));

        // Attempt to reconnect if not a manual close
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, delay);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setState(prev => ({
          ...prev,
          error: 'WebSocket connection error',
          isConnecting: false,
        }));
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to create WebSocket connection',
        isConnecting: false,
      }));
    }
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect');
      wsRef.current = null;
    }

    setState(prev => ({
      ...prev,
      isConnected: false,
      isConnecting: false,
    }));
  };

  const sendMessage = (message: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected. Message not sent:', message);
    }
  };

  const handleMessage = (message: WebSocketMessage) => {
    switch (message.type) {
      case 'connection':
        console.log('WebSocket connection confirmed:', message.data);
        break;
      
      case 'pong':
        // Handle ping/pong for connection health
        break;
      
      case 'test_update':
        // Handle test-related updates
        console.log('Test update received:', message.data);
        break;
      
      case 'notification':
        // Handle notifications
        console.log('Notification received:', message.data);
        break;
      
      default:
        console.log('Unknown WebSocket message type:', message.type);
    }
  };

  // Auto-connect on mount
  useEffect(() => {
    connect();

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, []);

  // Ping/pong to keep connection alive
  useEffect(() => {
    if (state.isConnected) {
      const pingInterval = setInterval(() => {
        sendMessage({
          type: 'ping',
          timestamp: new Date().toISOString(),
        });
      }, 30000); // Ping every 30 seconds

      return () => clearInterval(pingInterval);
    }
  }, [state.isConnected]);

  const value: WebSocketContextType = {
    ...state,
    sendMessage,
    connect,
    disconnect,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = (): WebSocketContextType => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

// Custom hook for sending behavioral data
export const useBehaviorTracking = () => {
  const { sendMessage, isConnected } = useWebSocket();

  const trackBehavior = (data: any) => {
    if (isConnected) {
      sendMessage({
        type: 'behavioral_data',
        data,
        timestamp: new Date().toISOString(),
      });
    }
  };

  return { trackBehavior };
};

export default useWebSocket;
