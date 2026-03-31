"use client";
import React, { useState, useEffect } from 'react'
import { Search, MoreVertical, Phone, Video, Info, Image, Smile, Send, ChevronLeft, Menu, X, User, Settings } from 'lucide-react'
import { useRouter, useParams } from 'next/navigation'
import axios from 'axios';

// Types
interface Participant {
  id: string;
  _id?: string;
  name: string;
  username: string;
  avatar?: string | null;
  isOnline: boolean;
  lastSeen?: string;
}

interface LastMessage {
  content: string;
  timestamp: string;
  isRead: boolean;
  senderId: string;
}

interface Conversation {
  id: string;
  _id?: string;
  participant: Participant;
  lastMessage: LastMessage;
  unreadCount: number;
}

interface UserData {
  id: string;
  _id?: string;
  name: string;
  email: string;
}

interface ApiConversation {
  _id: string;
  participants: Participant[];
  isGroup: boolean;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

const API_BASE_URL = 'http://localhost:3046';

const getUserData = (): UserData | null => {
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

export default function MessagesPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params?.userId as string;
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Get current user from localStorage
  useEffect(() => {
    const userData = getUserData();
    setCurrentUser(userData);
  }, []);

  // Format timestamp helper
  const formatTimestamp = (timestamp: string): string => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
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

  // Helper to get participant ID consistently
  const getParticipantId = (participant: Participant): string => {
    return participant.id || participant._id || '';
  };

  // Transform API conversation to UI conversation format
  const transformApiConversation = (apiConv: ApiConversation, currentUserId: string): Conversation | null => {
    // Find the other participant (not the current user)
    const otherParticipant = apiConv.participants.find(
      p => getParticipantId(p) !== currentUserId
    );
    
    if (!otherParticipant) return null;
    
    return {
      id: apiConv._id,
      participant: {
        id: getParticipantId(otherParticipant),
        name: otherParticipant.name,
        username: otherParticipant.username,
        avatar: otherParticipant.avatar,
        isOnline: otherParticipant.isOnline || false,
        lastSeen: otherParticipant.lastSeen
      },
      lastMessage: {
        content: 'No messages yet',
        timestamp: apiConv.lastMessageAt,
        isRead: true,
        senderId: ''
      },
      unreadCount: 0
    };
  };
  
  // When URL has userId, fetch user details and set as selected
  useEffect(() => {
    if (userId && currentUser) {
      // Set the selected chat to the userId from URL
      setSelectedChat(userId);
      
      // Check if conversation exists, if not create it
      const initConversation = async () => {
        try {
          const currentUserId = currentUser.id || currentUser._id;
          
          const response = await axios.post(
            `${API_BASE_URL}/api/v1/conversations/with/${userId}`,
            {
              userId1: currentUserId
            },
            {
              headers: {
                'Content-Type': 'application/json'
              },
              withCredentials: true
            }
          );
          
          console.log('Conversation initialized:', response.data);
          
          // If conversation is new, add it to the conversations list
          if (response.data.isNew && response.data.conversation?.participants) {
            const otherParticipant = response.data.conversation.participants.find(
              (p: Participant) => getParticipantId(p) !== currentUserId
            );
            
            if (otherParticipant) {
              const newConversation: Conversation = {
                id: response.data.conversation.id || response.data.conversation._id,
                participant: {
                  id: getParticipantId(otherParticipant),
                  name: otherParticipant.name,
                  username: otherParticipant.username,
                  avatar: otherParticipant.avatar,
                  isOnline: otherParticipant.isOnline || false,
                  lastSeen: otherParticipant.lastSeen
                },
                lastMessage: {
                  content: '',
                  timestamp: new Date().toISOString(),
                  isRead: true,
                  senderId: ''
                },
                unreadCount: 0
              };
              
              setConversations(prev => {
                const exists = prev.some(c => c.id === newConversation.id);
                return exists ? prev : [newConversation, ...prev];
              });
            }
          }
        } catch (error) {
          console.error('Failed to initialize conversation:', error);
        }
      };
      
      initConversation();
    }
  }, [userId, currentUser]);
  
  // Fetch all conversations
  useEffect(() => {
    const fetchConversations = async () => {
      const userData = getUserData();
      const loggedInUserId = userData?.id || userData?._id;
      
      if (!loggedInUserId) {
        console.error('No logged in user ID found');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await axios.post(
          `${API_BASE_URL}/api/v1/conversations/`,
          { id: loggedInUserId }, 
          { withCredentials: true }
        );
        
        console.log('Conversations API response:', response.data);
        
        if (response.data.conversations && Array.isArray(response.data.conversations)) {
          const transformedConvs = response.data.conversations
            .map((conv: ApiConversation) => transformApiConversation(conv, loggedInUserId))
            .filter((conv: Conversation | null): conv is Conversation => conv !== null);
          
          setConversations(transformedConvs);
        } else {
          setConversations([]);
        }
      } catch (error) {
        console.error('Failed to fetch conversations:', error);
        setConversations([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (currentUser) {
      fetchConversations();
    }
  }, [currentUser]);
  
  // Handle clicking on a conversation
  const handleConversationClick = (participantId: string) => {
    setSelectedChat(participantId);
    setIsMobileMenuOpen(false);
    // Only push to router if it's a different chat
    if (participantId !== userId) {
      router.push(`/messages/${participantId}`);
    }
  };
  
  const getInitialAvatar = (name: string) => name?.charAt(0).toUpperCase() || '?';
  
  // Filter conversations by search
  const filteredConversations = conversations.filter(conv => 
    conv.participant.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.participant.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

    const EmptyConversationView = () => (
    <div className="hidden lg:flex flex-col items-center justify-center h-full text-center p-8">
      <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center mb-6">
        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-200 to-purple-200 flex items-center justify-center">
          <Send className="w-8 h-8 text-blue-500" />
        </div>
      </div>
      <h3 className="text-2xl font-bold text-gray-800 mb-2">Your Messages</h3>
      <p className="text-gray-500 mb-6 max-w-md">
        Send private messages to a friend or group. Select a conversation from the left to get started.
      </p>
      <button 
        onClick={() => router.push('/search')}
        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full hover:shadow-lg transition-shadow"
      >
        Find People to Chat With
      </button>
    </div>
  );

  // Mobile Empty View
  const MobileEmptyView = () => (
    <div className="flex lg:hidden flex-col items-center justify-center h-full text-center p-8">
      <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center mb-4">
        <Send className="w-8 h-8 text-blue-500" />
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">No Conversation Selected</h3>
      <p className="text-gray-500 mb-6">
        Select a conversation from the list to start messaging
      </p>
    </div>
  );
  // Chat Header Component - FIXED VERSION
  const ChatHeader = () => {
    const [participant, setParticipant] = useState<Participant | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
      const fetchUser = async () => {
        if (!selectedChat) return;
        
        try {
          setLoading(true);
          setError(null);
          
          // First, try to find the participant from existing conversations
          const existingConversation = conversations.find(
            conv => getParticipantId(conv.participant) === selectedChat
          );
          
          if (existingConversation) {
            // Use existing participant data
            setParticipant(existingConversation.participant);
            setLoading(false);
            return;
          }
          
          // If not found in conversations, fetch user details
          const response = await axios.get(`${API_BASE_URL}/api/v1/users/${selectedChat}`, {
            withCredentials: true
          });
          
          console.log('User fetch response:', response.data);
          
          // Adjust based on your API response structure
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
          } else {
            setError('User not found');
          }
        } catch (err) {
          console.error('Failed to fetch user:', err);
          setError('Failed to load user');
        } finally {
          setLoading(false);
        }
      };
      
      fetchUser();
    }, [selectedChat, conversations]);
    
    if (loading) {
      return (
        <div className="border-b border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
            <div>
              <div className="w-24 h-4 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="w-16 h-3 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      );
    }
    
    if (error || !participant) {
      return (
        <div className="border-b border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setSelectedChat(null);
                router.push('/messages');
              }}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-full"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="text-red-500">
              {error || 'User not found'}
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="border-b border-gray-100 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setSelectedChat(null);
              router.push('/messages');
            }}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-full"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {getInitialAvatar(participant.name)}
              </span>
            </div>
            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
              participant.isOnline ? 'bg-green-500' : 'bg-gray-400'
            }`} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{participant.name}</h3>
            <p className="text-xs text-gray-500">
              {participant.isOnline ? 'Active now' : participant.lastSeen ? `Last seen ${formatTimestamp(participant.lastSeen)}` : 'Offline'}
            </p>
          </div>
        </div>
       
      </div>
    );
  };

  // Rest of your components remain the same...
  // ChatMessages, ChatInput, EmptyConversationView, MobileEmptyView
const ChatMessages = () => {
    const [messages, setMessages] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [conversationId, setConversationId] = useState<string | null>(null);
    
    useEffect( () => 
    {
      setIsLoading(false);
    })
    
    if (isLoading) {
      return (
        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-3xl mx-auto space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className={`flex gap-3 ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                {i % 2 !== 0 && <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />}
                <div className="flex-1 max-w-[70%]">
                  <div className={`w-32 h-4 bg-gray-200 rounded animate-pulse mb-2 ${i % 2 === 0 ? 'ml-auto' : ''}`} />
                  <div className={`w-64 h-16 bg-gray-200 rounded animate-pulse ${i % 2 === 0 ? 'ml-auto' : ''}`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    
    if (messages.length === 0) {
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
          {messages.map((message: any, index) => (
            <div 
              key={message.id || index} 
              className={`flex ${message.senderId === currentUser?.id || message.senderId === currentUser?._id ? 'justify-end' : 'justify-start'}`}
            >
              {message.senderId !== currentUser?.id && message.senderId !== currentUser?._id && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mr-2 flex-shrink-0">
                  <span className="text-white text-xs font-bold">
                    {getInitialAvatar(message.senderName || 'U')}
                  </span>
                </div>
              )}
              <div className={`max-w-[70%] p-3 rounded-2xl ${
                message.senderId === currentUser?.id || message.senderId === currentUser?._id
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-br-none' 
                  : 'bg-gray-100 text-gray-900 rounded-bl-none'
              }`}>
                <p className="text-sm">{message.content}</p>
                <p className={`text-xs mt-1 ${message.senderId === currentUser?.id || message.senderId === currentUser?._id ? 'text-blue-100' : 'text-gray-500'}`}>
                  {formatTimestamp(message.timestamp || message.createdAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Chat Input Component
  const ChatInput = () => {
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    
    const handleSend = async () => {
      // if (!message.trim() || !participantId || !currentUser) return;
      
      try {
        setIsSending(true);
        
        // First ensure conversation exists
        // const convResponse = await axios.post(
        //   `${API_BASE_URL}/api/v1/conversations/with/${participantId}`,
        //   {
        //     userId1: currentUser.id || currentUser._id
        //   },
        //   { withCredentials: true }
        // );
        
        // const conversationId = convResponse.data.conversation?.id || convResponse.data.conversation?._id;
        
        // // Then send message
        // await axios.post(
        //   `${API_BASE_URL}/api/v1/messages`,
        //   {
        //     conversationId: conversationId,
        //     content: message.trim(),
        //     recipientId: participantId
        //   },
        //   { withCredentials: true }
        // );
        
        setMessage('');
        
        // You could refresh messages here or use WebSocket
        
      } catch (error) {
        console.error('Failed to send message:', error);
      } finally {
        setIsSending(false);
      }
    };
    
    return (
      <div className="border-t border-gray-100 p-4">
        <div className="flex items-center gap-3 max-w-3xl mx-auto">
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Image className="w-5 h-5 text-gray-500" />
          </button>
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !isSending && handleSend()}
              className="w-full px-4 py-3 bg-gray-50 rounded-full focus:outline-none focus:ring-2 focus:border-0 focus:ring-blue-500 text-black border-2 border-gray-300"
              disabled={isSending}
            />
            <button className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Smile className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors" />
            </button>
          </div>
          <button 
            onClick={handleSend}
            disabled={!message.trim() || isSending}
            className={`p-3 rounded-full transition-all ${
              message.trim() && !isSending
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

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Menu Toggle */}
     <button 
  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
  className={`lg:hidden fixed z-50 p-2 bg-white rounded-full shadow-lg transition-all duration-300 ${
    isMobileMenuOpen ? 'top-4 right-4' : 'top-4 left-4'
  }`}
>
  {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
</button>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Conversations List */}
        <div className={`
          flex flex-col w-full lg:w-96 border-r border-gray-200 bg-white
          transition-all duration-300 ease-in-out
          ${selectedChat && !isMobileMenuOpen ? 'hidden lg:flex' : 'flex'}
          ${isMobileMenuOpen ? 'fixed inset-0 z-40 lg:relative lg:inset-auto' : ''}
        `}>
          {/* Conversations Header */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Messages</h2>
              
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search messages"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-black border-2 border-gray-300"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <div key={i} className="p-4 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse" />
                  <div className="flex-1">
                    <div className="w-24 h-4 bg-gray-200 rounded animate-pulse mb-2" />
                    <div className="w-32 h-3 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
              ))
            ) : filteredConversations.length > 0 ? (
              filteredConversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => handleConversationClick(conversation.participant.id)}
                  className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                    selectedChat === conversation.participant.id ? 'bg-blue-50 border-r-4 border-blue-500' : ''
                  }`}
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {getInitialAvatar(conversation.participant.name)}
                      </span>
                    </div>
                    <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                      conversation.participant.isOnline ? 'bg-green-500' : 'bg-gray-400'
                    }`} />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {conversation.participant.name}
                      </h3>
                      <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                        {formatTimestamp(conversation.lastMessage.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {conversation.lastMessage.content}
                    </p>
                  </div>
                  {conversation.unreadCount > 0 && (
                    <div className="w-6 h-6 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center flex-shrink-0">
                      {conversation.unreadCount}
                    </div>
                  )}
                </button>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                {searchQuery ? 'No conversations match your search' : 'No conversations yet'}
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col bg-white ${!selectedChat ? 'hidden lg:flex' : 'flex'}`}>
          {selectedChat ? (
            <>
              <ChatHeader />
              
              <ChatMessages />
              <ChatInput />

            </>
          ) : (
            <>
              <EmptyConversationView />
              <MobileEmptyView />
            </>
          )}
        </div>
      </div>
    </div>
  );
}