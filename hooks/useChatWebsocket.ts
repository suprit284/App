// hooks/useChatWebSocket.ts
import { useEffect, useState, useRef, useCallback } from 'react';

export interface Message {
  _id: string;
  conversation: string;
  sender: {
    _id: string;
    name: string;
    email: string;
    username: string;
    avatar?: string;
  };
  content: string;
  messageType: 'text' | 'image' | 'video' | 'file' | 'audio';
  attachments?: Array<{
    url: string;
    fileType: string;   
    fileName: string;
    size: number;
  }>;
  readBy: Array<{
    user: string;
    readAt: Date;
  }>;
  isEdited: boolean;
  isDeleted: boolean;
  deletedFor: string[];
  reactions: Array<{
    user: string;
    emoji: string;
    reactedAt: Date;
  }>;
  replyTo?: string | Message;
  createdAt: Date;
  updatedAt: Date;
}

type Status = 'online' | 'offline' | 'away';

// Match backend message types exactly
interface BackendMessage {
  type: string;
  message?: Message;
  messages?: Message[];
  messageId?: string;
  userId?: string;
  conversationId?: string;
  isTyping?: boolean;
  content?: string;
  messageType?: string;
  replyToId?: string;
  limit?: number;
  before?: Date;
  forEveryone?: boolean;
  emoji?: string;
  error?: string;
  status?: string;
  timestamp?: Date;
  connectedUsers?: number;
  id?: string;
  isOnline?: boolean;
}

export function useChatWebSocket() {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentTokenRef = useRef<string | null>(null);
  const shouldReconnectRef = useRef<boolean>(true);
  const isConnectingRef = useRef<boolean>(false);
  const hasAttemptedAutoConnect = useRef<boolean>(false); // Track if auto-connect has been attempted

  // Setup WebSocket event handlers matching backend protocol
  const setupWebSocketHandlers = useCallback((wsInstance: WebSocket) => {
    wsInstance.onopen = () => {
      console.log('✅ WebSocket connected');
      setIsConnected(true);
      console.log(isConnected,"i am live now")
      isConnectingRef.current = false;
    };
    //add code here
   wsInstance.onclose = (event) => {
  console.log('🔌 WebSocket disconnected:', event.code, event.reason);
  setIsConnected(false);
  
  // ✅ CORRECT: Only reconnect if:
  // 1. Reconnect is enabled (shouldReconnectRef.current)
  // 2. Token exists (currentTokenRef.current)
  // 3. Close code is NOT 1000 (not a manual logout)
  if (shouldReconnectRef.current && currentTokenRef.current && event.code !== 1000) {
    console.log('🔄 Attempting to reconnect in 3 seconds...');
    reconnectTimeoutRef.current = setTimeout(() => {
      if (shouldReconnectRef.current && currentTokenRef.current) {
        console.log('🔄 Reconnecting...');
        connect(currentTokenRef.current);
      }
    }, 3000);
  } else if (event.code === 1000) {
    console.log('👋 Manual disconnect (logout) - no auto-reconnect');
  } else {
    console.log('❌ Reconnect disabled or no token available');
  }
};

    wsInstance.onerror = (error) => {
      // console.error('❌ WebSocket error:', error);
      setIsConnected(false);
      isConnectingRef.current = false;
    };

    wsInstance.onmessage = (event) => {
      try {
        const data: BackendMessage = JSON.parse(event.data);
        console.log('📡 Received message:', data.type, data);
        
        switch (data.type) {
          case 'connection_established':
            console.log('Connection established:', {
              userId: data.userId,
              connectedUsers: data.connectedUsers
            });
            break;

          case 'user_status':
            // Handle user online/offline status from broadcast
            if (data.id && data.isOnline !== undefined) {
              setOnlineUsers(prev => {
                const newSet = new Set(prev);
                if (data.isOnline) {
                  newSet.add(String(data.id));
                } else {
                  newSet.delete(String(data.id));
                }
                return newSet;
              });
            }
            break;

          case 'new_message':
            // New message from other user
            if (data.message) {
              console.log('💬 New message received:', data.message);
              setMessages(prev => [data.message!, ...prev]);
            }
            break;

          case 'message_sent':
            // Message sent confirmation
            if (data.message) {
              console.log('📤 Message sent confirmation:', data.message);
              setMessages(prev => [data.message!, ...prev]);
            }
            break;

          case 'read_receipt':
            // Read receipt from other user
            if (data.messageId && data.userId) {
              console.log('👁️ Read receipt:', data.messageId, data.userId);
              setMessages(prev => prev.map(msg => 
                msg._id === data.messageId && !msg.readBy.some(r => r.user === data.userId)
                  ? { ...msg, readBy: [...msg.readBy, { user: data.userId!, readAt: new Date() }] }
                  : msg
              ));
            }
            break;

          case 'typing_indicator':
            // Typing indicator from other user
            if (data.userId && data.conversationId && data.isTyping !== undefined) {
              console.log(`✍️ User ${data.userId} ${data.isTyping ? 'started' : 'stopped'} typing`);
              // You can handle typing indicator UI here
            }
            break;

          case 'conversation_history':
            // Conversation history response
            if (data.messages && Array.isArray(data.messages)) {
              console.log('📚 Conversation history:', data.messages.length);
              setMessages(data.messages);
            }
            break;

          case 'message_deleted':
            // Message deleted
            if (data.messageId) {
              console.log('🗑️ Message deleted:', data.messageId);
              if (data.forEveryone) {
                setMessages(prev => prev.filter(msg => msg._id !== data.messageId));
              }
            }
            break;

          case 'reaction_added':
            // Reaction added to message
            if (data.messageId && data.userId && data.emoji) {
              console.log('😊 Reaction added:', data);
              setMessages(prev => prev.map(msg => 
                msg._id === data.messageId
                  ? { 
                      ...msg, 
                      reactions: [
                        ...msg.reactions.filter(r => r.user !== data.userId),
                        { user: data.userId!, emoji: data.emoji!, reactedAt: new Date() }
                      ]
                    }
                  : msg
              ));
            }
            break;

          case 'unread_messages':
            // Unread messages from server
            if (data.messages && Array.isArray(data.messages)) {
              console.log('📬 Unread messages:', data.messages.length);
              setMessages(prev => [...data.messages!, ...prev]);
            }
            break;

          case 'error':
            console.error('❌ WebSocket error:', data.error);
            break;

          default:
            console.log('Unknown message type:', data.type);
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };
  }, []);

  // Connect function using native WebSocket
  const connect = useCallback((token: string) => {
    // Prevent multiple connection attempts
    if (isConnectingRef.current) {
      console.log('Connection already in progress, skipping...');
      return;
    }
    
    // Don't reconnect if already connected with same token
    if (wsRef.current?.readyState === WebSocket.OPEN && currentTokenRef.current === token) {
      console.log('Already connected');
      return;
    }

    // Clear any existing reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    console.log('Starting new WebSocket connection...');
    isConnectingRef.current = true;
    shouldReconnectRef.current = true;
    currentTokenRef.current = token;

    // Build WebSocket URL with token as query parameter (matching backend)
    let wsUrl = process.env.NEXT_PUBLIC_WS_URL;
    if (!wsUrl) {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      wsUrl = `${protocol}//${host}/ws`;
      console.log('Using derived WebSocket URL:', wsUrl);
    }

    // Ensure proper protocol
    if (!wsUrl.startsWith('ws://') && !wsUrl.startsWith('wss://')) {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      wsUrl = `${protocol}//${wsUrl.replace(/^\/\//, '')}`;
    }

    // Add token as query parameter (backend expects token in URL or headers)
    const wsUrlWithToken = `${wsUrl}?token=${token}`;
    console.log('Connecting to WebSocket URL:', wsUrlWithToken);
    
    const wsInstance = new WebSocket(wsUrlWithToken);
    setupWebSocketHandlers(wsInstance);
    
    console.log("now check the status of connection: ",isConnected)
    wsRef.current = wsInstance;
    setWs(wsInstance);
  }, [setupWebSocketHandlers]);

  // Disconnect function
  const disconnect = useCallback(() => {
    console.log('Disconnecting WebSocket...');
    shouldReconnectRef.current = false;
    isConnectingRef.current = false;
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect');
      wsRef.current = null;
    }
    
    setWs(null);
    setIsConnected(false);
    currentTokenRef.current = null;
    setOnlineUsers(new Set());
    console.log('WebSocket disconnected manually');
  }, []);

  // Send message helper
  const send = useCallback((type: string, data: any) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket not connected, cannot send message:', type);
      return false;
    }
    
    const message = JSON.stringify({ type, ...data });
    wsRef.current.send(message);
    console.log('📤 Sent message:', type, data);
    return true;
  }, []);

  // Send message (matches backend 'message' type)
  const sendMessage = useCallback((
    conversationId: string, 
    content: string, 
    messageType: string = 'text', 
    replyToId?: string
  ): boolean => {
    return send('message', {
      conversationId,
      content,
      messageType,
      replyToId
    });
  }, [send]);

  // Send typing indicator (matches backend 'typing' type)
  const sendTyping = useCallback((conversationId: string, isTyping: boolean) => {
    send('typing', { conversationId, isTyping });
  }, [send]);

  // Mark message as read (matches backend 'read_receipt' type)
  const markAsRead = useCallback((messageId: string) => {
    send('read_receipt', { messageId });
  }, [send]);

  // Delete message (matches backend 'delete_message' type)
  const deleteMessage = useCallback((messageId: string, forEveryone: boolean = false) => {
    send('delete_message', { messageId, forEveryone });
  }, [send]);

  // Add reaction to message (matches backend 'add_reaction' type)
  const addReaction = useCallback((messageId: string, emoji: string) => {
    send('add_reaction', { messageId, emoji });
  }, [send]);

  // Get conversation history (matches backend 'get_conversation_history' type)
  const getConversationHistory = useCallback((conversationId: string, limit: number = 50, before?: Date) => {
    send('get_conversation_history', { conversationId, limit, before });
  }, [send]);

  // Check if user is online
  const isUserOnline = useCallback((userId: string): boolean => {
    return onlineUsers.has(userId);
  }, [onlineUsers]);

  // Auto-connect only once when token is available - FIXED VERSION
  useEffect(() => {
    // Only attempt auto-connect once
    if (!hasAttemptedAutoConnect.current) {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      if (token && !isConnected && !isConnectingRef.current) {
        console.log('🔄 Auto-connecting WebSocket with stored token...');
        hasAttemptedAutoConnect.current = true;
        connect(token);
      } else if (!token) {
        // Mark as attempted even if no token, to prevent retrying
        hasAttemptedAutoConnect.current = true;
      }
    }
  }, [connect, isConnected]); // Remove token from dependencies

  // Reset auto-connect flag when manually disconnected
  useEffect(() => {
    if (!isConnected && !currentTokenRef.current) {
      // Reset auto-connect flag when disconnected and no token
      hasAttemptedAutoConnect.current = false;
    }
  }, [isConnected]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('Cleaning up WebSocket hook...');
      shouldReconnectRef.current = false;
      isConnectingRef.current = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmount');
        wsRef.current = null;
      }
    };
  }, []);

  return {
    connect,
    disconnect,
    sendMessage,
    sendTyping,
    markAsRead,
    deleteMessage,
    addReaction,
    getConversationHistory,
    isConnected,
    messages,
    setMessages,
    onlineUsers,
    isUserOnline,
  };
}