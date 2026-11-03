import { create } from 'zustand';

export type Status = 'online' | 'offline' | 'away';

export interface Conversation {
  userId: string;
  name: string;
  lastMessage: string;
  avatar?: string | null;
  timestamp?: Date;
  unreadCount?: number;
  status?: Status;
  isOnline?: boolean;
}

interface StatusStore {
  // State
  conversations: Conversation[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  updateConversations: (conversations: Conversation[]) => void;
  addConversation: (conversation: Conversation) => void;
  fetchConversations: (userId: string) => Promise<void>;
  clearConversations: () => void;
}

const API_BASE_URL = 'http://localhost:3046';

export const useStatusStore = create<StatusStore>()((set, get) => ({
  // ========== INITIAL STATE ==========
  conversations: [],
  isLoading: false,
  error: null,

  // ========== CONVERSATION ACTIONS ==========
  updateConversations: (conversations: Conversation[]) => {
    set((state) => ({
      ...state,
      conversations
    }));
  },

  addConversation: (conversation: Conversation) => {
    set((state) => {
      const exists = state.conversations.some(
        conv => conv.userId === conversation.userId
      );
      
      if (exists) {
        const updated = state.conversations.map(conv =>
          conv.userId === conversation.userId
            ? { ...conv, ...conversation }
            : conv
        );
        return { ...state, conversations: updated };
      }
      
      return {
        ...state,
        conversations: [conversation, ...state.conversations]
      };
    });
  },

  clearConversations: () => {
    set((state) => ({
      ...state,
      conversations: [],
      error: null
    }));
  },

  // ========== FETCH CONVERSATIONS ==========
  fetchConversations: async (userId: string) => {
    if (!userId) {
      console.error('No userId provided to fetchConversations');
      set((state) => ({
        ...state,
        error: 'No userId provided'
      }));
      return;
    }
    
    set((state) => ({
      ...state,
      isLoading: true,
      error: null
    }));
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/conversations/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: userId }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch conversations: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.conversations && Array.isArray(data.conversations)) {
        const transformedConvs: Conversation[] = [];
        
        for (const conv of data.conversations) {
          const otherParticipant = conv.participants?.find(
            (p: any) => (p.id || p._id) !== userId
          );
          
          if (otherParticipant) {
            const otherUserId = otherParticipant.id || otherParticipant._id;
            
            transformedConvs.push({
              userId: otherUserId,
              name: otherParticipant.name || 'Unknown User',
              lastMessage: conv.lastMessage?.content || 'No messages yet',
              avatar: otherParticipant.avatar || null,
              timestamp: conv.lastMessageAt ? new Date(conv.lastMessageAt) : new Date(),
              unreadCount: conv.unreadCount || 0,
              status: 'offline',
              isOnline: false
            });
          }
        }
        
        set((state) => ({
          ...state,
          conversations: transformedConvs,
          isLoading: false
        }));
      } else {
        set((state) => ({
          ...state,
          conversations: [],
          isLoading: false
        }));
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      set((state) => ({
        ...state,
        error: error instanceof Error ? error.message : 'Failed to fetch conversations',
        isLoading: false
      }));
    }
  },
}));