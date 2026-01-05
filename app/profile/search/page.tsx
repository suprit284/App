'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import axios from 'axios';

// Dynamically import Lucide icons
const SearchIcon = dynamic(() => import('lucide-react').then(mod => mod.Search), { ssr: false });
const UserIcon = dynamic(() => import('lucide-react').then(mod => mod.User), { ssr: false });
const MessageCircle = dynamic(() => import('lucide-react').then(mod => mod.MessageCircle), { ssr: false });
const X = dynamic(() => import('lucide-react').then(mod => mod.X), { ssr: false });
const Loader = dynamic(() => import('lucide-react').then(mod => mod.Loader), { ssr: false });

// TypeScript interfaces
interface User {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: string;
  displayInitial?: string;
}

interface SearchUserProps {
  currentUser?: User; // Make optional since you might not pass it
  onStartChat?: (user: User) => void; // Optional callback
}

// User Card Component
const UserCard = ({ user, onStartChat }: { user: User; onStartChat: (user: User) => void }) => {
  return (
    <div className="bg-white rounded-xl border border-blue-100 p-4 hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between">
        {/* User Info */}
        <div className="flex items-center">
          {/* Avatar with fallback to initial */}
          <div className="relative">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {user.displayInitial || user.name.charAt(0)}
                </span>
              </div>
            )}
            {/* Online Status Indicator */}
            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
              user.isOnline ? 'bg-green-500' : 'bg-gray-400'
            }`}></div>
          </div>

          {/* User Details */}
          <div className="ml-4">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-900">{user.name}</h3>
              {user.isOnline && (
                <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                  Online
                </span>
              )}
            </div>
            <p className="text-gray-600 text-sm">@{user.username}</p>
            {!user.isOnline && user.lastSeen && (
              <p className="text-xs text-gray-500">
                Last seen {new Date(user.lastSeen).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => onStartChat(user)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:shadow-md transition-all duration-200"
        >
          <MessageCircle className="w-4 h-4" />
          Message
        </button>
      </div>
    </div>
  );
};

export default function SearchPage({ currentUser, onStartChat }: SearchUserProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Mock current user if not provided
  const currentUserData = currentUser || {
    id: 'current-user-123',
    name: 'Current User',
    username: 'currentuser',
    avatar: '',
    isOnline: true
  };

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch users when debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    fetchSearchResults(debouncedQuery);
  }, [debouncedQuery]);

  const fetchSearchResults = async (query: string) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.get(`http://localhost:3046/api/v1/users/search?q=${encodeURIComponent(query)}`);
      
      if (response.data.success) {
        // Filter out current user from results
        const filteredResults = response.data.users.filter((user: User) => 
          user.id !== currentUserData.id
        );
        setSearchResults(filteredResults);
      } else {
        setError(response.data.message || 'Search failed');
        setSearchResults([]);
      }
    } catch (err: any) {
      console.error('Search error:', err);
      setError('Failed to search users. Please try again.');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartChat = (user: User) => {
    if (onStartChat) {
      onStartChat(user);
    } else {
      // Default behavior: navigate to messages or start chat
      console.log('Starting chat with:', user);
      router.push(`/profile/messages?user=${user.id}`);
    }
    
    // Clear search after selecting
    setSearchQuery('');
    setSearchResults([]);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setError('');
  };

  return (
    <div className="h-full bg-gradient-to-br from-blue-50 to-purple-50 p-4 lg:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Search Users
        </h1>
        <p className="text-gray-600 mt-1">
          Find people by name or username
        </p>
      </div>

      {/* Search Input */}
      <div className="relative mb-8">
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Type name or username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-12 py-3 bg-white border border-blue-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all"
            autoFocus
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Start typing to search. Minimum 2 characters required.
        </p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-8">
          <Loader className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl mb-4">
          <p className="text-red-600 text-center">{error}</p>
        </div>
      )}

      {/* Search Results */}
      <div className="space-y-3">
        {searchResults.length > 0 ? (
          searchResults.map((user) => (
            <UserCard 
              key={user.id}
              user={user}
              onStartChat={handleStartChat}
            />
          ))
        ) : (
          !isLoading && debouncedQuery.length >= 2 && !error && (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                <UserIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No users found
              </h3>
              <p className="text-gray-600">
                No users match "{debouncedQuery}"
              </p>
            </div>
          )
        )}

        {/* Initial State - Before Search */}
        {!searchQuery && !isLoading && !error && (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
              <SearchIcon className="w-10 h-10 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Find People to Chat With
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Search for users by their name or username. 
              Start typing in the search box above.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}