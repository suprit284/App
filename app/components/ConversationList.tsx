// components/ConversationList.tsx
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Search, MessageCircle, ArrowLeft } from 'lucide-react';
import { useStatusStore, type Conversation } from '@/stores/statusStore';
import StatusBadge from '@/app/components/StatusBadge';
import { ConnectionStatusIndicator } from './ConnnectionStatusIndicator';

interface ConversationListProps {
  initialConversations?: Conversation[];
}

function ConversationList({ initialConversations = [] }: ConversationListProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  console.log("🟢 ConversationList rendered");
  const val = useRef(0);

useEffect(() => {
  val.current += 1; // Increment after every render
  console.log(val.current);
});

console.log(val.current);
  // Check if we're on a specific chat route (mobile view)
  const isChatOpen = pathname.match(/\/message\/([^/]+)/);
  
  // Get store methods and state
  const { 
    conversations: storeConversations, 
    isLoading, 
    fetchConversations,
    updateConversations,
    
    error
  } = useStatusStore();
  
  // Use store conversations if available, otherwise use initialConversations
  const conversations = storeConversations.length > 0 ? storeConversations : initialConversations;
  
  useEffect(() => {
    const getUserFromLocalStorage = () => {
      try {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          setCurrentUserId(user.id || null);
          return user.id;
        }
      } catch (error) {
        console.error("Failed to parse user from localStorage:", error);
      }
      return null;
    };
    
    const userId = getUserFromLocalStorage();
    
    if (userId) {
      // ✅ Only fetch if store is empty AND not already loading
      const initializeData = async () => {
        // Fetch online users first
      
        
        // Then fetch conversations if needed
        if (storeConversations.length === 0 && !isLoading) {
          await fetchConversations(userId);
        }
      };
      initializeData();
      
      
    }
  }, []); // Only run on mount

  // Initialize store with server-side initial data if store is empty
  useEffect(() => {
    if (initialConversations.length > 0 && storeConversations.length === 0) {
      updateConversations(initialConversations);
    }
  }, [initialConversations, storeConversations.length, updateConversations]);
  
  // Get current selected chat from URL
  useEffect(() => {
    const match = pathname.match(/\/message\/([^/]+)/);
    if (match && match[1]) {
      setSelectedChat(match[1]);
    } else {
      setSelectedChat(null);
    }
  }, [pathname]);
  
  // Format timestamp helper
  const formatTimestamp = (timestamp?: Date | string): string => {
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
  
  const getInitialAvatar = (name: string) => name?.charAt(0).toUpperCase() || '?';
  
  // Filter conversations by search
  const filteredConversations = conversations.filter(conv => 
    conv.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleConversationClick = useCallback((userId: string) => {
    setSelectedChat(userId);
    router.push(`/message/${userId}`);
  }, [router]);
  
  const handleBackToList = useCallback(() => {
    router.push('/message');
  }, [router]);
  
  // Show loading state
  if (isLoading && conversations.length === 0) {
    return (
      <div className="flex flex-col w-full lg:w-96 border-r border-gray-200 bg-white h-full">
        <div className="p-4 border-b border-gray-100 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Messages</h2>
            <ConnectionStatusIndicator />
          </div>
          <div className="relative">
            <div className="w-full h-10 bg-gray-50 rounded-xl animate-pulse" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse" />
              <div className="flex-1">
                <div className="w-24 h-4 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="w-32 h-3 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // Show error state
  if (error && conversations.length === 0) {
    return (
      <div className="flex flex-col w-full lg:w-96 border-r border-gray-200 bg-white h-full items-center justify-center p-4">
        <div className="text-center">
          <div className="mb-4">
            <ConnectionStatusIndicator />
          </div>
          <MessageCircle className="w-12 h-12 mx-auto mb-3 text-red-300" />
          <p className="text-red-600 text-sm">Error loading conversations</p>
          <p className="text-xs text-gray-500 mt-1">{error}</p>
          <button 
            onClick={() => currentUserId && fetchConversations(currentUserId)}
            className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <div className={`
        flex flex-col border-r border-gray-200 bg-white h-full
        w-full lg:w-96
        ${isChatOpen ? 'hidden lg:flex' : 'flex'}
      `}>
        {/* Header */}
        <div className="p-4 border-b border-gray-100 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Messages</h2>
            <ConnectionStatusIndicator />
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-black border border-gray-200"
            />
          </div>
        </div>
        
        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conv) => {
              // ✅ Check if user is online
              const isOnline = conv.isOnline || false;
              
              return (
                <button
                  key={conv.userId}
                  onClick={() => handleConversationClick(conv.userId)}
                  className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                    selectedChat === conv.userId ? 'bg-blue-50 border-r-4 border-blue-500' : ''
                  }`}
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                      {conv.avatar ? (
                        <img 
                          src={conv.avatar} 
                          alt={conv.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-bold text-lg">
                          {getInitialAvatar(conv.name)}
                        </span>
                      )}
                    </div>
                    {/* ✅ StatusBadge with isOnline prop */}
                    <div className="absolute bottom-0 right-0">
                      <StatusBadge 
                        isOnline={isOnline} 
                        size="sm"
                      />
                    </div>
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {conv.name}
                        </h3>
                        {/* ✅ Show online status text */}
                        {isOnline && (
                          <span className="text-xs text-green-500 font-medium">● Online</span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                        {formatTimestamp(conv.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {conv.lastMessage}
                    </p>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="p-8 text-center text-gray-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">
                {searchQuery ? 'No conversations match your search' : 'No conversations yet'}
              </p>
              <p className="text-xs mt-1 text-gray-400">
                Start a conversation by messaging someone
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Back Button */}
      {isChatOpen && (
        <button
          onClick={handleBackToList}
          className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-full shadow-md"
        >
          <ArrowLeft size={20} />
        </button>
      )}
    </>
  );
}

export default ConversationList;