'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import axios from 'axios';

// Dynamically import Lucide icons
const SearchIcon = dynamic(() => import('lucide-react').then(mod => mod.Search), { ssr: false });
const UserIcon = dynamic(() => import('lucide-react').then(mod => mod.User), { ssr: false });
const MessageCircle = dynamic(() => import('lucide-react').then(mod => mod.MessageCircle), { ssr: false });
const MailIcon = dynamic(() => import('lucide-react').then(mod => mod.Mail), { ssr: false });
const X = dynamic(() => import('lucide-react').then(mod => mod.X), { ssr: false });
const Loader = dynamic(() => import('lucide-react').then(mod => mod.Loader), { ssr: false });
const FilterIcon = dynamic(() => import('lucide-react').then(mod => mod.Filter), { ssr: false });
const CheckIcon = dynamic(() => import('lucide-react').then(mod => mod.Check), { ssr: false });

// TypeScript interfaces
interface User {
  id: string;
  name: string;
  username: string;
  email: string; // Now including email
  avatar?: string;
  isOnline: boolean;
  lastSeen?: string;
  createdAt?: string;
  displayInitial?: string;
}

interface SearchUserProps {
  currentUser?: User;
  onStartChat?: (user: User) => void;
}

// Filter types
type FilterType = 'all' | 'online' | 'recent';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3046';
// User Card Component
const UserCard = ({ user, onStartChat }: { user: User; onStartChat: (user: User) => void }) => {
  const router = useRouter();
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleViewProfile = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/profile/${user.id}`);
  };

  return (
    <div className="bg-white rounded-xl border border-blue-100 p-4 hover:shadow-md transition-all duration-200 hover:border-blue-300">
      <div className="flex items-center justify-between">
        {/* User Info */}
        <div className="flex items-center space-x-4">
          {/* Avatar */}
          <div className="relative">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-14 h-14 rounded-full object-cover"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-xl">
                  {user.displayInitial || user.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            {/* Online Status Indicator */}
            <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${
              user.isOnline ? 'bg-green-500' : 'bg-gray-400'
            }`}></div>
          </div>

          {/* User Details */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-900 text-lg">{user.name}</h3>
              {user.isOnline && (
                <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                  Online
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-3 text-sm">
              <span className="text-gray-600 flex items-center">
                <UserIcon className="w-3.5 h-3.5 mr-1" />
                @{user.username}
              </span>
              
              <span className="text-gray-600 flex items-center">
                <MailIcon className="w-3.5 h-3.5 mr-1" />
                {user.email}
              </span>
            </div>
            
            <div className="flex items-center gap-3 text-xs text-gray-500">
              {!user.isOnline && user.lastSeen && (
                <span>Last seen {formatDate(user.lastSeen)}</span>
              )}
              {user.createdAt && (
                <span>Joined {formatDate(user.createdAt)}</span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          
         
        </div>
      </div>
    </div>
  );
};

export default function SearchPage({ currentUser, onStartChat }: SearchUserProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [filteredResults, setFilteredResults] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Mock current user if not provided
  const currentUserData = currentUser || {
    id: 'current-user-123',
    name: 'Current User',
    username: 'currentuser',
    email: 'user@example.com',
    avatar: '',
    isOnline: true
  };
  useEffect(() => {
  
  
  
  // Check if Search page has code that overwrites localStorage
  const storedUser = localStorage.getItem('user');
  if (storedUser && storedUser !== 'undefined') {
    try {
      JSON.parse(storedUser);
      console.log('✅ User data is valid JSON');
    } catch {
      console.log('❌ User data is NOT valid JSON');
    }
  }
  
  // After Search page operations
  // console.log('After Search page operations:', localStorage.getItem('user'));
}, []);
  useEffect(() => {
  
          
      const verifyAuth = async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/api/v1/middleware`, {
            method: 'POST',
            credentials: 'include', // Sends cookies
            headers: {
              'Content-Type': 'application/json',
            },
          });
  
          if (response.status === 200) {
            // User is authenticated, allow rendering
            const data = await response.json();
            console.log('Authenticated:', data.user);
            
          } else {
            // Not authenticated, redirect to login
            router.push('/login');
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          router.push('/login');
        }
      };
      
  
      
      verifyAuth();
    }, [router]);
  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch users when debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim().length < 2) {
      setSearchResults([]);
      setFilteredResults([]);
      setTotalResults(0);
      return;
    }

    fetchSearchResults(debouncedQuery);
  }, [debouncedQuery]);

  // Apply filters when search results or filter changes
  useEffect(() => {
    if (searchResults.length === 0) {
      setFilteredResults([]);
      return;
    }

    let filtered = [...searchResults];
    
    switch (activeFilter) {
      case 'online':
        filtered = filtered.filter(user => user.isOnline);
        break;
      case 'recent':
        filtered = filtered.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        break;
      case 'all':
      default:
        // Keep as is
        break;
    }
    
    setFilteredResults(filtered);
  }, [searchResults, activeFilter]);

  const fetchSearchResults = async (query: string) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.get(`http://localhost:3046/api/v1/users/search`, {
        params: { q: query },
        withCredentials: true // Important for sending cookies
      });
      
      if (response.data.success) {
        // Filter out current user from results
        const filteredResults = response.data.users.filter((user: User) => 
          user.id !== currentUserData.id && user.email !== currentUserData.email
        );
        
        setSearchResults(filteredResults);
        setTotalResults(response.data.count || filteredResults.length);
      } else {
        setError(response.data.message || 'Search failed');
        setSearchResults([]);
        setTotalResults(0);
      }
    } catch (err: any) {
      console.error('Search error:', err);
      
      if (err.response?.status === 401) {
        setError('Please login to search users');
        router.push('/login');
      } else {
        setError('Failed to search users. Please try again.');
      }
      
      setSearchResults([]);
      setTotalResults(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartChat = (user: User) => {
    if (onStartChat) {
      onStartChat(user);
    } else {
      // Navigate to messages with the selected user
      router.push(`/profile/messages?userId=${user.id}&name=${encodeURIComponent(user.name)}`);
    }
    
    // Clear search after selecting
    setSearchQuery('');
    setSearchResults([]);
    setFilteredResults([]);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setFilteredResults([]);
    setError('');
    setTotalResults(0);
    searchInputRef.current?.focus();
  };

  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter);
    setShowFilters(false);
  };

  const getSearchTips = () => {
    if (searchQuery.length === 0) {
      return "Try searching by name, username, or email address";
    }
    
    if (searchQuery.length === 1) {
      return "Type at least 2 characters to search...";
    }
    
    return `Searching for: ${searchQuery}`;
  };

  return (
    <div className="h-full bg-gradient-to-br from-blue-50 to-purple-50 p-4 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Find People
            </h1>
            <p className="text-gray-600 mt-1">
              Search by name, username, or email
            </p>
          </div>
          
          {/* Filter Button */}
          {searchResults.length > 0 && (
            <div className="relative">
              
              
              
            </div>
          )}
        </div>

        {/* Search Input */}
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search by name, username, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-12 py-3 bg-white border border-blue-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent text-black transition-all text-lg"
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
        
        <div className="flex justify-between items-center mt-2">
          <p className="text-sm text-gray-500">
            {getSearchTips()}
          </p>
          
          {totalResults > 0 && (
            <p className="text-sm font-medium text-blue-600">
              {totalResults} {totalResults === 1 ? 'result' : 'results'} found
            </p>
          )}
        </div>
      </div>

      {/* Results Area */}
      <div className="space-y-4">
        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader className="w-10 h-10 text-blue-500 animate-spin mb-4" />
            <p className="text-gray-600">Searching users...</p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="p-6 bg-red-50 border border-red-100 rounded-xl">
            <div className="flex items-center justify-center text-red-600 mb-2">
              <p className="text-center font-medium">{error}</p>
            </div>
            {error.includes('login') && (
              <div className="text-center mt-4">
                <button
                  onClick={() => router.push('/login')}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Go to Login
                </button>
              </div>
            )}
          </div>
        )}

        {/* Search Results */}
        {filteredResults.length > 0 ? (
          <>
            {activeFilter !== 'all' && (
              <div className="text-sm text-gray-500">
                Showing {filteredResults.length} of {totalResults} users
              </div>
            )}
            
            <div className="grid gap-4">
              {filteredResults.map((user) => (
                <UserCard 
                  key={user.id}
                  user={user}
                  onStartChat={handleStartChat}
                />
              ))}
            </div>
          </>
        ) : (
          !isLoading && debouncedQuery.length >= 2 && !error && (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                <UserIcon className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No users found
              </h3>
              <p className="text-gray-600 max-w-md mx-auto mb-6">
                No users match "{debouncedQuery}". Try searching with different keywords.
              </p>
              <div className="text-sm text-gray-500 space-y-1">
                <p>💡 Search tips:</p>
                <p>• Use full name or partial name</p>
                <p>• Try username with or without @</p>
                <p>• Search by email address</p>
              </div>
            </div>
          )
        )}

        {/* Initial State - Before Search */}
        {!searchQuery && !isLoading && !error && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
              <SearchIcon className="w-12 h-12 text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Connect with People
            </h3>
            <p className="text-gray-600 max-w-lg mx-auto mb-8 text-lg">
              Find users by their name, username, or email address 
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="p-4 bg-white rounded-xl border border-blue-100">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3 mx-auto">
                  <UserIcon className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Search by Name</h4>
                <p className="text-sm text-gray-600">Find users by their full or partial name</p>
              </div>
              
              <div className="p-4 bg-white rounded-xl border border-blue-100">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3 mx-auto">
                  <span className="text-purple-600 font-bold">@</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Search by Username</h4>
                <p className="text-sm text-gray-600">Find users by their unique username</p>
              </div>
              
              <div className="p-4 bg-white rounded-xl border border-blue-100">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3 mx-auto">
                  <MailIcon className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Search by Email</h4>
                <p className="text-sm text-gray-600">Find users by their email address</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}