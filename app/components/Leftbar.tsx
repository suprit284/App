'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  MessageCircle, 
  User, 
  Settings, 
  X, 
  Menu, 
  Search, 
  LogOut,
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

interface LeftbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  user?: {
    name: string;
    avatar: string;
    email?: string;
  };
}

interface CurrentUser {
  name: string;
  email: string;
  avatar?: string;
}

const API_BASE_URL = 'http://localhost:3046';

const Leftbar = ({ activeTab, onTabChange, user }: LeftbarProps) => {
  const [openSettings, setOpenSettings] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  
  const router = useRouter();

  // Fetch user data
  const fetchUserData = async () => {
    try {
      setLoading(true);
      const storedUser = localStorage.getItem('user');
      
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser && parsedUser.email) {
          try {
            const response = await fetch(`${API_BASE_URL}/api/v1/user/${parsedUser.email}`, {
              method: 'GET',
              credentials: 'include',
              headers: {
                'Accept': 'application/json',
              },
            });

            if (response.ok) {
              const data = await response.json();
              if (data.success && data.user) {
                setCurrentUser({
                  name: data.user.name || parsedUser.name || 'User',
                  email: data.user.email || parsedUser.email,
                  avatar: data.user.avatar || parsedUser.avatar
                });
              } else {
                setCurrentUser({
                  name: parsedUser.name || 'User',
                  email: parsedUser.email,
                  avatar: parsedUser.avatar
                });
              }
            } else {
              setCurrentUser({
                name: parsedUser.name || 'User',
                email: parsedUser.email,
                avatar: parsedUser.avatar
              });
            }
          } catch (error) {
            console.error('Error fetching user data:', error);
            setCurrentUser({
              name: parsedUser.name || 'User',
              email: parsedUser.email,
              avatar: parsedUser.avatar
            });
          }
        }
      } else if (user && user.name) {
        setCurrentUser({
          name: user.name,
          email: user.email || 'user@example.com',
          avatar: user.avatar
        });
      } else {
        setCurrentUser({
          name: 'User',
          email: 'user@example.com'
        });
      }
    } catch (error) {
      console.error('Error in user data:', error);
      setCurrentUser({
        name: 'User',
        email: 'user@example.com'
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch user data on mount
  useEffect(() => {
    fetchUserData();
  }, []);

  const menuItems = [
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      path: '/profile'
    },
    {
      id: 'message',
      label: "Messages",
      icon: MessageCircle,
      path: '/message'  // Make sure this matches your route
    },
    {
      id: 'search',
      label: 'Search',
      icon: Search,
      path: '/search'
    }
  ];

  const logoutUser = async () => {
    try {
      const sessionId = document.cookie
        .split('; ')
        .find(row => row.startsWith('session_id='))
        ?.split('=')[1];
      
      await fetch(`${API_BASE_URL}/api/v1/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId })
      });
      
      document.cookie = 'session_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      localStorage.removeItem('user');
      setCurrentUser(null);
      
      toast.success("Logout successful!");
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
      
    } catch (error) {
      console.error('Logout error:', error);
      document.cookie = 'session_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      localStorage.removeItem('user');
      setCurrentUser(null);
      window.location.href = '/login';
    }
  };

  const settingsItems = [
    {
      id: 'logout',
      label: 'Log Out',
      icon: LogOut,
      description: 'Sign out of your account',
      onClick: () => {
        logoutUser();
        setOpenSettings(false);
      },
      isDestructive: true
    }
  ];

  const handleTabClick = (item: any) => {
    if (onTabChange) {
      onTabChange(item.id);
    }
    router.push(item.path);
    setIsMobileOpen(false);
  };

  const getInitialAvatar = (name: string) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  // Fixed width - no collapse
  const sidebarWidth = 'w-64';

  return (
    <>
      <Toaster position="top-right" />
      
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg shadow-lg"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Backdrop for Mobile */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-30 transition-opacity duration-200"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar - Fixed width, no collapse */}
      <div 
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          ${sidebarWidth}
          bg-gradient-to-r from-blue-500 to-purple-600 text-white 
          flex flex-col transform transition-transform duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Mobile Close Button */}
        <button
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden absolute top-4 right-4 p-2 text-white hover:bg-white/20 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="p-6 border-b border-blue-400/30">
          <h1 className="text-2xl font-bold">ChatFlow</h1>
        </div>

        {/* User Profile */}
        <div className="p-4 border-b border-blue-400/20">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/30 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
              {loading ? (
                <div className="w-full h-full bg-white/20 animate-pulse rounded-full" />
              ) : currentUser?.avatar ? (
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-white/40 flex items-center justify-center">
                  <span className="text-xl font-bold text-white">
                    {getInitialAvatar(currentUser?.name || 'User')}
                  </span>
                </div>
              )}
            </div>
            
            {!loading && currentUser && (
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white truncate">{currentUser.name}</h3>
                <p className="text-blue-100 text-xs truncate">{currentUser.email}</p>
                <p className="text-blue-200 text-xs mt-0.5">Online</p>
              </div>
            )}
            
            {loading && (
              <div className="flex-1 min-w-0">
                <div className="h-4 bg-white/20 rounded animate-pulse mb-2 w-24" />
                <div className="h-3 bg-white/20 rounded animate-pulse w-32" />
              </div>
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleTabClick(item)}
                    className={`
                      w-full flex items-center space-x-3 px-4 py-3
                      rounded-xl transition-all duration-200 relative
                      ${isActive
                        ? 'bg-white/20 text-white shadow-lg' 
                        : 'text-blue-100 hover:bg-white/10 hover:text-white'
                      }
                    `}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-blue-200'}`} />
                    <span className="font-medium flex-1 text-left">{item.label}</span>
                    
                    {/* Active indicator - white dot */}
                    {isActive && (
                      <div className="w-2 h-2 bg-white rounded-full ml-auto" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Settings Button */}
        <div className="p-4 border-t border-blue-400/20">
          <button 
            onClick={() => setOpenSettings(true)}
            className="flex items-center space-x-3 w-full px-4 py-3 text-blue-100 hover:bg-white/10 rounded-xl transition-colors"
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium">Settings</span>
          </button>
        </div>
      </div>

      {/* Settings Popup - unchanged */}
      {openSettings && (
        <div className="fixed inset-0 z-50 flex items-start justify-center lg:justify-start pt-20 lg:pt-20 lg:pl-64 px-4">
          <div 
            className="fixed inset-0 bg-black/50 transition-opacity duration-200"
            onClick={() => setOpenSettings(false)}
          />
          
          <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-in slide-in-from-top-5 duration-200 lg:ml-4">
            {/* ... settings popup content (unchanged) ... */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                  {loading ? (
                    <div className="w-full h-full bg-white/20 animate-pulse" />
                  ) : currentUser?.avatar ? (
                    <img 
                      src={currentUser.avatar} 
                      alt={currentUser.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-white/40 flex items-center justify-center">
                      <span className="text-sm font-bold text-white">
                        {getInitialAvatar(currentUser?.name || 'User')}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  {loading ? (
                    <>
                      <div className="h-4 bg-gray-200 rounded animate-pulse mb-2 w-32" />
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-24" />
                    </>
                  ) : (
                    <>
                      <h3 className="font-semibold text-gray-900 truncate">
                        {currentUser?.name || 'User'}
                      </h3>
                      <p className="text-gray-500 text-sm truncate">
                        {currentUser?.email || 'user@example.com'}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="p-2">
              {settingsItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      item.onClick();
                      setOpenSettings(false);
                    }}
                    className={`w-full flex items-start space-x-3 p-3 rounded-xl transition-all duration-200 text-left ${
                      item.isDestructive 
                        ? 'text-red-600 hover:bg-red-50' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${
                      item.isDestructive ? 'bg-red-100' : 'bg-gray-100'
                    }`}>
                      <Icon className={`w-4 h-4 ${item.isDestructive ? 'text-red-600' : 'text-gray-600'}`} />
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${item.isDestructive ? 'text-red-600' : 'text-gray-900'}`}>
                        {item.label}
                      </p>
                      <p className={`text-sm ${item.isDestructive ? 'text-red-500' : 'text-gray-500'}`}>
                        {item.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="p-4 border-t border-gray-100">
              <button
                onClick={() => setOpenSettings(false)}
                className="w-full py-2 px-4 text-gray-600 hover:text-gray-800 font-medium rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Leftbar;