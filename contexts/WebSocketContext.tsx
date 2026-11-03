// contexts/WebSocketContext.tsx
'use client';

import { createContext, useContext, ReactNode, useMemo } from 'react';
import { useChatWebSocket } from '@/hooks/useChatWebsocket';

// ============================================
// EXPORT ALL TYPES from the hook
// ============================================


// Or if you want to define them explicitly (optional - for better control)
// You can also define them here if you don't want to depend on the hook's types
export interface Participant {
  _id: string;
  name: string;
  email: string;
  username: string;
  avatar?: string;
}

type Status = 'online' | 'offline' | 'away';
export interface ReadReceipt {
  user: string;
  readAt: Date;
}

export interface Reaction {
  user: string;
  emoji: string;
  reactedAt: Date;
}

export interface Attachment {
  url: string;
  fileType: string;
  fileName: string;
  size: number;
}

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
  attachments?: Attachment[];
  readBy: ReadReceipt[];
  isEdited: boolean;
  isDeleted: boolean;
  deletedFor: string[];
  reactions: Reaction[];
  replyTo?: string | Message;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// CONTEXT TYPE DEFINITION
// ============================================

// Explicitly define the context type
export interface WebSocketContextType {
  // Connection management
  connect: (token: string) => void;
  disconnect: () => void;
  
  // Message operations
  sendMessage: (conversationId: string, content: string, messageType?: string) => boolean;
  sendTyping: (conversationId: string, isTyping: boolean) => void;
  markAsRead: (messageId: string) => void;
  deleteMessage: (messageId: string, forEveryone?: boolean) => void;
  addReaction: (messageId: string, emoji: string) => void;
  getConversationHistory: (conversationId: string, limit?: number, before?: Date) => void;
  
  // State
  isConnected: boolean;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;

}

// ============================================
// CONTEXT CREATION
// ============================================

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

// ============================================
// PROVIDER COMPONENT
// ============================================

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const {
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
  } = useChatWebSocket();

  // console.log(isConnected);
  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo<WebSocketContextType>(
    () => ({
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
      
    }),
    [
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

    ]
  );

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
}



export function useWebSocket(): WebSocketContextType {
  const context = useContext(WebSocketContext);
  // console.log(context);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}


export type MessageType = Message['messageType'];
export type MessageSender = Message['sender'];