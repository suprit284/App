// app/message/[userId]/page.tsx
'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, Image, Send } from 'lucide-react';
import axios from 'axios';
import { useWebSocket } from '@/contexts/WebSocketContext';
import type { Message } from '@/contexts/WebSocketContext';
import StatusBadge from '@/app/components/StatusBadge';

interface Participant {
  id: string;
  _id?: string;
  name: string;
  username: string;
  avatar?: string | null;
  isOnline: boolean;
  lastSeen?: string;
}

interface UserData {
  id: string;
  _id?: string;
  name: string;
  email: string;
}

const API_BASE_URL = 'http://localhost:3046';

export const getUserData = (): UserData | null => {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr) as UserData;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

export default function ConversationPage() {
  console.log("rendered convo page");
  const params = useParams();
  const router = useRouter();
  const userId = params?.userId as string;
  
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isExiting, setIsExiting] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // WebSocket from context
  const {
    sendMessage,
    sendTyping,
    isConnected,
    messages: wsMessages,
    markAsRead,
  } = useWebSocket();

  // Get current user on mount
  useEffect(() => {
    const userData = getUserData();
    setCurrentUser(userData);
    
    const timer = setTimeout(() => {
      setShouldShow(true);
    }, 10);
    
    return () => clearTimeout(timer);
  }, []);

  // Fetch or create conversation
  useEffect(() => {
    const getOrCreateConversation = async () => {
      if (!currentUser || !userId) return;
      
      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/v1/conversations`,
          {
            participantId: userId
          },
          { withCredentials: true }
        );
        
        if (response.data.conversation?._id) {
          setConversationId(response.data.conversation._id);
          console.log('✅ Conversation ID:', response.data.conversation._id);
          
          // If conversation has participant data, use it
          if (response.data.conversation.participants) {
            const otherParticipant = response.data.conversation.participants.find(
              (p: any) => {
                const pId = p._id || p.id;
                const currentId = currentUser.id || currentUser._id;
                return pId !== currentId;
              }
            );
            if (otherParticipant) {
              setParticipant({
                id: otherParticipant._id || otherParticipant.id,
                name: otherParticipant.name,
                username: otherParticipant.username,
                avatar: otherParticipant.avatar,
                isOnline: otherParticipant.isOnline || false,
                lastSeen: otherParticipant.lastSeen
              });
              setLoading(false);
            }
          }
        }
      } catch (error) {
        console.error('Failed to get/create conversation:', error);
      }
    };
    
    getOrCreateConversation();
  }, [currentUser, userId]);

  // Fetch user details if not available from conversation
  useEffect(() => {
    const fetchUser = async () => {
      // If we already have participant data, skip fetch
      if (participant) {
        setLoading(false);
        return;
      }
      
      if (!userId) return;
      
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/api/v1/users/${userId}`, {
          withCredentials: true
        });
        
        const userData = response.data.user || response.data;
        
        if (userData) {
          setParticipant({
            id: userData.id || userData._id,
            name: userData.name,
            username: userData.username || userData.name,
            avatar: userData.avatar,
            isOnline: userData.isOnline || false,
            lastSeen: userData.lastSeen
          });
        }
      } catch (err) {
        console.error('Failed to fetch user:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUser();
  }, [userId, participant]);

  // Mark messages as read when conversation is opened
  useEffect(() => {
    if (conversationId && wsMessages.length > 0 && currentUser) {
      const currentUserId = currentUser.id || currentUser._id;
      const unreadMessages = wsMessages.filter(
        msg => msg.conversation === conversationId && 
               msg.sender._id !== currentUserId &&
               !msg.readBy.some(read => read.user === currentUserId)
      );
      
      unreadMessages.forEach(msg => {
        markAsRead(msg._id);
      });
    }
  }, [conversationId, wsMessages, currentUser, markAsRead]);

  // Filter messages for this specific conversation
  const conversationMessages = wsMessages.filter(
    msg => msg.conversation === conversationId
  );

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationMessages]);

  const handleBack = () => {
    setIsExiting(true);
    setTimeout(() => {
      router.push('/message');
    }, 300);
  };

  const formatTimestamp = (timestamp: string | Date): string => {
    if (!timestamp) return '';
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const getInitialAvatar = (name: string) => name?.charAt(0).toUpperCase() || '?';

  // Chat Header Component with StatusBadge
  const ChatHeader = () => {
    // Use participant's isOnline status from the participant object
    const isOnline = participant?.isOnline || false;
    
    if (loading) {
      return (
        <div className="border-b border-gray-100 p-4 bg-white">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-full"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
            <div>
              <div className="w-24 h-4 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="w-16 h-3 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      );
    }
    
    if (!participant) {
      return (
        <div className="border-b border-gray-100 p-4 bg-white">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-full"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="text-red-500">User not found</div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="border-b border-gray-100 p-4 flex items-center justify-between bg-white">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Back to conversations"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {getInitialAvatar(participant.name)}
              </span>
            </div>
            {/* StatusBadge with participant's isOnline status */}
            <div className="absolute bottom-0 right-0">
              <StatusBadge 
                isOnline={isOnline} 
                size="md"
              />
            </div>
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{participant.name}</h3>
            <p className="text-xs text-gray-500">
              {isOnline ? 'Active now' : 'Offline'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          <span className="text-xs text-gray-500">
            {isConnected ? 'Live' : 'Offline'}
          </span>
        </div>
      </div>
    );
  };

  // Chat Messages Component
  const ChatMessages = () => {
    if (conversationMessages.length === 0) {
      return (
        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-3xl mx-auto h-full flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Send className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm">No messages yet. Start the conversation!</p>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {conversationMessages.map((message: Message, index: number) => {
            const currentUserId = currentUser?.id || currentUser?._id;
            const isCurrentUser = message.sender._id === currentUserId;
            return (
              <div 
                key={message._id || index} 
                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} animate-fadeIn`}
              >
                {!isCurrentUser && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mr-2 flex-shrink-0">
                    <span className="text-white text-xs font-bold">
                      {getInitialAvatar(message.sender.name)}
                    </span>
                  </div>
                )}
                <div className={`max-w-[70%] p-3 rounded-2xl ${
                  isCurrentUser
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-br-none' 
                    : 'bg-gray-100 text-gray-900 rounded-bl-none'
                }`}>
                  <p className="text-sm break-words">{message.content}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <p className={`text-xs ${isCurrentUser ? 'text-blue-100' : 'text-gray-500'}`}>
                      {formatTimestamp(message.createdAt)}
                    </p>
                    {isCurrentUser && message.readBy?.length > 0 && (
                      <span className="text-xs text-blue-100">✓✓</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>
    );
  };

  // Chat Input Component
  const ChatInput = () => {
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    
    const handleSend = async () => {
      if (!message.trim() || !conversationId || !currentUser || !userId) return;
      
      try {
        setIsSending(true);
        
        const success = sendMessage(conversationId, message.trim());
        
        if (success) {
          setMessage('');
          
          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
          }
          sendTyping(conversationId, false);
        } else {
          console.error('Failed to send message - WebSocket not connected');
        }
      } catch (error) {
        console.error('Failed to send message:', error);
      } finally {
        setIsSending(false);
      }
    };
    
    const handleTyping = () => {
      if (!conversationId) return;
      
      sendTyping(conversationId, true);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        sendTyping(conversationId, false);
      }, 1000);
    };
    
    return (
      <div className="border-t border-gray-100 p-4 bg-white">
        <div className="flex items-center gap-3 max-w-3xl mx-auto">
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Image className="w-5 h-5 text-gray-500" />
          </button>
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              placeholder={isConnected ? "Message..." : "Connecting..."}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                handleTyping();
              }}
              onKeyPress={(e) => e.key === 'Enter' && !isSending && message.trim() && handleSend()}
              className="w-full px-4 py-3 bg-gray-50 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-black border-2 border-gray-300"
              disabled={isSending || !isConnected || !conversationId}
            />
          </div>
          <button 
            onClick={handleSend}
            disabled={!message.trim() || isSending || !isConnected || !conversationId}
            className={`p-3 rounded-full transition-all ${
              message.trim() && !isSending && isConnected && conversationId
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg hover:scale-105' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  };

  if (!shouldShow) {
    return null;
  }
  
  return (
    <div className={`
      fixed inset-0 lg:relative lg:inset-auto
      flex flex-col h-full w-full bg-gray-50
      z-50 lg:z-auto
      ${isExiting ? 'animate-slideOut' : 'animate-slideIn'}
      lg:animate-none
    `}>
      <ChatHeader />
      <ChatMessages />
      <ChatInput />
    </div>
  );
}