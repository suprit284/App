'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

// Dynamically import Lucide icons to avoid SSR issues
const Search = dynamic(() => import('lucide-react').then(mod => mod.Search), { ssr: false });
const MoreVertical = dynamic(() => import('lucide-react').then(mod => mod.MoreVertical), { ssr: false });
const Video = dynamic(() => import('lucide-react').then(mod => mod.Video), { ssr: false });
const Phone = dynamic(() => import('lucide-react').then(mod => mod.Phone), { ssr: false });
const ImageIcon = dynamic(() => import('lucide-react').then(mod => mod.Image as any), { ssr: false });
const Send = dynamic(() => import('lucide-react').then(mod => mod.Send), { ssr: false });
const Smile = dynamic(() => import('lucide-react').then(mod => mod.Smile), { ssr: false });
const ChevronLeft = dynamic(() => import('lucide-react').then(mod => mod.ChevronLeft), { ssr: false });
const Filter = dynamic(() => import('lucide-react').then(mod => mod.Filter), { ssr: false });
const Plus = dynamic(() => import('lucide-react').then(mod => mod.Plus), { ssr: false });

// Define TypeScript interfaces
interface User {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline';
  lastSeen: string;
}

interface LastMessage {
  text: string;
  time: string;
  unread: number;
  isSender: boolean;
}

interface Conversation {
  id: number;
  user: User;
  lastMessage: LastMessage;
  isTyping: boolean;
}

interface Message {
  id: number;
  text: string;
  time: string;
  isSender: boolean;
}

export default function MessagesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeChat, setActiveChat] = useState<number | null>(null);

  // Sample conversations data
  const conversations: Conversation[] = [
    {
      id: 1,
      user: {
        id: 'user1',
        name: 'Emma Watson',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
        status: 'online',
        lastSeen: '2 min ago'
      },
      lastMessage: {
        text: 'See you tomorrow at the meeting!',
        time: '2:30 PM',
        unread: 3,
        isSender: false
      },
      isTyping: false
    },
    {
      id: 2,
      user: {
        id: 'user2',
        name: 'Michael Scott',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        status: 'online',
        lastSeen: '5 min ago'
      },
      lastMessage: {
        text: 'That sounds like a great plan!',
        time: '1:45 PM',
        unread: 0,
        isSender: true
      },
      isTyping: true
    },
    {
      id: 3,
      user: {
        id: 'user3',
        name: 'Sarah Johnson',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        status: 'offline',
        lastSeen: '1 hour ago'
      },
      lastMessage: {
        text: 'Check out this cool design I found',
        time: '11:20 AM',
        unread: 1,
        isSender: false
      },
      isTyping: false
    },
    {
      id: 4,
      user: {
        id: 'user4',
        name: 'Alex Turner',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
        status: 'online',
        lastSeen: 'Just now'
      },
      lastMessage: {
        text: 'Thanks for your help yesterday!',
        time: 'Yesterday',
        unread: 0,
        isSender: true
      },
      isTyping: false
    },
    {
      id: 5,
      user: {
        id: 'user5',
        name: 'Olivia Parker',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
        status: 'offline',
        lastSeen: '2 hours ago'
      },
      lastMessage: {
        text: 'Are we still on for Friday?',
        time: 'Yesterday',
        unread: 2,
        isSender: false
      },
      isTyping: false
    }
  ];

  // Sample messages for active chat
  const messages: Message[] = [
    { id: 1, text: 'Hey there! How are you?', time: '2:25 PM', isSender: true },
    { id: 2, text: 'I\'m good! Just finished work', time: '2:26 PM', isSender: false },
    { id: 3, text: 'Want to grab coffee tomorrow?', time: '2:27 PM', isSender: true },
    { id: 4, text: 'Sure! 10 AM at our usual place?', time: '2:28 PM', isSender: false },
    { id: 5, text: 'Perfect! See you then 😊', time: '2:30 PM', isSender: true }
  ];

  const filteredConversations = conversations.filter(conv =>
    conv.user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeUser = activeChat ? conversations.find(c => c.id === activeChat)?.user : null;

  // Handle back button click
  const handleBack = () => {
    if (activeChat) {
      setActiveChat(null);
    } else {
      router.back(); // Go back to previous page
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Left Panel - Conversations List */}
      <div className={`w-full lg:w-1/3 ${activeChat ? 'hidden lg:block' : 'block'} border-r border-blue-100/50 flex flex-col h-full`}>
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <button 
                  onClick={handleBack}
                  className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-xl font-bold">Messages</h2>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <Filter className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/80" />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/15 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto bg-white/50 backdrop-blur-sm">
          {filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => setActiveChat(conversation.id)}
              className={`flex items-center p-4 border-b border-blue-100/30 cursor-pointer transition-all ${
                activeChat === conversation.id 
                  ? 'bg-gradient-to-r from-blue-500/10 to-purple-600/10' 
                  : 'hover:bg-white/70'
              }`}
            >
              {/* Avatar with gradient border */}
              <div className="relative mr-3">
                <div className={`absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 p-0.5 transform -rotate-6`}>
                  <div className="w-full h-full bg-white rounded-full"></div>
                </div>
                <img
                  src={conversation.user.avatar}
                  alt={conversation.user.name}
                  className="relative w-12 h-12 rounded-full object-cover z-10"
                />
                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white z-20 ${
                  conversation.user.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                }`}></div>
              </div>

              {/* Conversation Info */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {conversation.user.name}
                  </h3>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {conversation.lastMessage.time}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <p className={`text-sm truncate ${
                    conversation.lastMessage.unread > 0 
                      ? 'font-semibold text-gray-900' 
                      : 'text-gray-600'
                  }`}>
                    {conversation.lastMessage.isSender && (
                      <span className="text-gray-500 mr-1">You: </span>
                    )}
                    {conversation.lastMessage.text}
                    {conversation.isTyping && (
                      <span className="text-blue-600 ml-1 italic">typing...</span>
                    )}
                  </p>
                  
                  {conversation.lastMessage.unread > 0 && (
                    <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-semibold px-2 py-1 rounded-full min-w-[20px] text-center shadow-sm">
                      {conversation.lastMessage.unread}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel - Chat Area */}
      <div className={`flex-1 flex flex-col h-full ${activeChat ? 'block' : 'hidden lg:block'}`}>
        {activeUser ? (
          <>
            {/* Chat Header with gradient */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <button 
                      onClick={() => setActiveChat(null)}
                      className="lg:hidden mr-3 p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="flex items-center">
                      <div className="relative mr-3">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-white/40 to-white/20 p-0.5">
                          <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
                        </div>
                        <img
                          src={activeUser.avatar}
                          alt={activeUser.name}
                          className="relative w-10 h-10 rounded-full object-cover z-10"
                        />
                        <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white z-20 ${
                          activeUser.status === 'online' ? 'bg-green-400' : 'bg-gray-300'
                        }`}></div>
                      </div>
                      <div>
                        <h3 className="font-bold">{activeUser.name}</h3>
                        <p className="text-sm text-white/80">
                          {activeUser.status === 'online' ? 'Online' : `Last seen ${activeUser.lastSeen}`}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                      <Phone className="w-5 h-5" />
                    </button>
                    <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                      <Video className="w-5 h-5" />
                    </button>
                    <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-white to-blue-50">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isSender ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-3 shadow-sm ${
                        message.isSender
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-br-none'
                          : 'bg-white text-gray-900 rounded-bl-none border border-blue-100'
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <p className={`text-xs mt-1 ${
                        message.isSender ? 'text-blue-200' : 'text-gray-500'
                      }`}>
                        {message.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Message Input */}
            <div className="p-4 bg-white border-t border-blue-100">
              <div className="flex items-center space-x-3">
                <button className="p-2.5 hover:bg-blue-50 rounded-full transition-colors text-blue-600">
                  <ImageIcon  />
                </button>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    className="w-full px-4 py-3 bg-blue-50 border border-blue-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-300 focus:bg-white transition-all"
                  />
                  <button className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 hover:bg-blue-100 rounded-full">
                    <Smile className="w-5 h-5 text-blue-600" />
                  </button>
                </div>
                <button className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-200">
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Empty State - No chat selected */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-blue-50 to-purple-50">
            <div className="relative mb-6">
              <div className="w-32 h-32 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-full flex items-center justify-center">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-500/30 to-purple-600/30 rounded-full flex items-center justify-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-xl">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
              Your Messages
            </h3>
            <p className="text-gray-600 max-w-md text-lg">
              Select a conversation to start chatting. Your messages are waiting!
            </p>
            <div className="mt-8 flex flex-wrap gap-3 justify-center">
              <div className="px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-600/10 rounded-full border border-blue-200">
                <span className="text-sm text-blue-700">💬 Real-time chat</span>
              </div>
              <div className="px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-600/10 rounded-full border border-blue-200">
                <span className="text-sm text-purple-700">🔒 End-to-end encrypted</span>
              </div>
              <div className="px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-600/10 rounded-full border border-blue-200">
                <span className="text-sm text-blue-700">⚡ Instant delivery</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}