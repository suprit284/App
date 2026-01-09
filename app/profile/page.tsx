'use client';

import { useState, useEffect, useCallback, useMemo , } from 'react';
import { Mail, User as UserIcon, AlertCircle, Edit2, Check, X } from 'lucide-react';
import Image from 'next/image';
import { toast, Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation';


interface User {
  _id?: string;
  name: string;
  email: string;
  username: string;
  avatar?: string;
  bio?: string;
  isOnline?: boolean;
  lastSeen?: Date;
  createdAt?: Date;
}

interface ValidationRules {
  minNameLength: number;
  maxNameLength: number;
  minUsernameLength: number;
  maxUsernameLength: number;
}

const VALIDATION_RULES: ValidationRules = {
  minNameLength: 2,
  maxNameLength: 50,
  minUsernameLength: 3,
  maxUsernameLength: 30,
} as const;

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3046';

export default function ProfilePage() {
  // State management
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<User | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
      const router = useRouter();
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
          // Optionally store user data
          localStorage.setItem('user', JSON.stringify(data.user));
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
  // Memoized validation function
  const validateUserData = useCallback((data: User): string | null => {
    if (!data.name.trim()) return 'Name is required';
    if (!data.username.trim()) return 'Username is required';
    
    if (data.name.length < VALIDATION_RULES.minNameLength) {
      return `Name must be at least ${VALIDATION_RULES.minNameLength} characters`;
    }
    
    if (data.name.length > VALIDATION_RULES.maxNameLength) {
      return `Name must not exceed ${VALIDATION_RULES.maxNameLength} characters`;
    }
    
    if (data.username.length < VALIDATION_RULES.minUsernameLength) {
      return `Username must be at least ${VALIDATION_RULES.minUsernameLength} characters`;
    }
    
    if (data.username.length > VALIDATION_RULES.maxUsernameLength) {
      return `Username must not exceed ${VALIDATION_RULES.maxUsernameLength} characters`;
    }
    
    return null;
  }, []);

  // Memoized fetch user function
  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get email from localStorage
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        throw new Error('No user found. Please login.');
      }
      
      const userData = JSON.parse(storedUser);
      const userEmail = userData.email;
      
      if (!userEmail) {
        throw new Error('Email not found in user data');
      }
      
      // Fetch user data from API
      const response = await fetch(`${API_BASE_URL}/api/v1/user/${userEmail}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.user) {
        setUser(data.user);
        setEditedUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        throw new Error(data.error || 'Failed to get user data');
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Failed to fetch user:', err);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch user data on component mount
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // Handle save changes
  const handleSave = useCallback(async () => {
    if (!editedUser || !user) return;

    // Validate input
    const validationError = validateUserData(editedUser);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    // Check if anything actually changed
    const hasChanges = editedUser.name !== user.name || editedUser.username !== user.username;
    if (!hasChanges) {
      setIsEditing(false);
      toast('No changes detected', { icon: 'ℹ️' });
      return;
    }

    try {
      setSaveLoading(true);

      // Call API to update user
      const response = await fetch(`${API_BASE_URL}/api/v1/users/${user.email}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          name: editedUser.name.trim(),
          username: editedUser.username.trim(),
          avatar: editedUser.avatar || undefined
        }),
      });

      const data = await response.json();

if (data.success && data.user) {
  localStorage.setItem('user', JSON.stringify(data.user)); // ← Use data.user
}
      if (!response.ok) {
        throw new Error(data.error || `Update failed: ${response.status}`);
      }

      if (data.success) {
        setUser(data.user);
        setEditedUser(data.user);
        setIsEditing(false);
        localStorage.setItem('user', JSON.stringify(data.user));
        toast.success('Profile updated successfully!');
      } else {
        throw new Error(data.error || 'Update failed');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Update failed';
      console.error('Update error:', err);
      toast.error(errorMessage);
    } finally {
      setSaveLoading(false);
    }
  }, [editedUser, user, validateUserData]);

  // Handle cancel edit
  const handleCancel = useCallback(() => {
    if (user) {
      setEditedUser({ ...user });
    }
    setIsEditing(false);
  }, [user]);

  // Handle input change
  const handleInputChange = useCallback((field: keyof User, value: string) => {
    setEditedUser(prev => prev ? { ...prev, [field]: value } : null);
  }, []);

  // Memoized user initials
  const userInitials = useMemo(() => 
    user?.name?.charAt(0).toUpperCase() || '?'
  , [user?.name]);

  // Memoized avatar component
  const AvatarComponent = useMemo(() => {
    if (!user) return null;

    if (user.avatar) {
      return (
        <Image
          src={user.avatar}
          alt={user.name}
          width={160}
          height={160}
          className="w-full h-full object-cover"
          priority
          unoptimized={user.avatar.startsWith('http')}
        />
      );
    }


    

    return (
      <div className="w-full h-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
        <span className="text-white text-4xl md:text-5xl font-bold">
          {userInitials}
        </span>
      </div>
    );
  }, [user, userInitials]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md w-full">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Profile</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchUserData}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // No user state
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <UserIcon className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">No User Found</h2>
        <p className="text-gray-600 mb-6">Please login to view your profile</p>
        <button
          onClick={() => window.location.href = '/login'}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        }}
      />
      
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 px-4 py-6 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Profile Settings</h1>
            <p className="text-gray-600 mt-1">Manage your personal information</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Profile Header - Responsive layout */}
            <div className="p-6 md:p-8 lg:p-10">
              <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                
                {/* Left: Profile Picture */}
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-full border-4 border-white shadow-xl overflow-hidden mx-auto lg:mx-0">
                      {AvatarComponent}
                    </div>
                    
                    {/* Online Status Indicator */}
                    {user.isOnline && (
                      <div className="absolute bottom-3 right-3 lg:bottom-4 lg:right-4 w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  
                  {/* Upload Button (Future Feature) */}
                 
                </div>

                {/* Right: Profile Info */}
                <div className="flex-1 min-w-0">
                  {/* Name & Edit Button Row */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <div className="space-y-4">
                          {/* Name Input */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Full Name
                            </label>
                            <input
                              type="text"
                              value={editedUser?.name || ''}
                              onChange={(e) => handleInputChange('name', e.target.value)}
                              className="w-full px-4 py-3 text-base text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                              placeholder="Enter your name"
                              maxLength={VALIDATION_RULES.maxNameLength}
                              disabled={saveLoading}
                            />
                            <p className="text-xs text-gray-500 mt-2">
                              {editedUser?.name?.length || 0}/{VALIDATION_RULES.maxNameLength} characters
                            </p>
                          </div>
                          
                          {/* Username Input */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Username
                            </label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">@</span>
                              <input
                                type="text"
                                value={editedUser?.username || ''}
                                onChange={(e) => handleInputChange('username', e.target.value)}
                                className="w-full pl-8 pr-4 py-3 text-base text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                placeholder="username"
                                maxLength={VALIDATION_RULES.maxUsernameLength}
                                disabled={saveLoading}
                              />
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                              {editedUser?.username?.length || 0}/{VALIDATION_RULES.maxUsernameLength} characters
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 break-words">
                            {user.name}
                          </h2>
                          <div className="flex items-center gap-2 mt-2">
                            <UserIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                            <span className="text-gray-600 font-medium text-base sm:text-lg break-all">
                              @{user.username}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3">
                      {isEditing ? (
                        <>
                          <button 
                            onClick={handleSave}
                            disabled={saveLoading}
                            className={`px-5 sm:px-6 py-2.5 rounded-lg transition-all flex items-center gap-2 ${
                              saveLoading 
                                ? 'bg-blue-400 cursor-not-allowed' 
                                : 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700'
                            } text-white font-medium shadow-sm`}
                          >
                            {saveLoading ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Saving...
                              </>
                            ) : (
                              <>
                                <Check className="w-4 h-4" />
                                Save
                              </>
                            )}
                          </button>
                          <button 
                            onClick={handleCancel}
                            disabled={saveLoading}
                            className="px-5 sm:px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 active:bg-gray-300 transition-colors font-medium flex items-center gap-2"
                          >
                            <X className="w-4 h-4" />
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button 
                          onClick={() => setIsEditing(true)} 
                          className="px-5 sm:px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:opacity-90 active:opacity-80 transition-opacity font-medium shadow-md flex items-center gap-2"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit Profile
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Email Section */}
                  <div className="mb-6">
                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <Mail className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-500 mb-1">Email Address</div>
                        <div className="text-gray-900 font-medium break-all">{user.email}</div>
                        <p className="text-xs text-gray-500 mt-1">
                          This is your primary email for notifications and login
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Bio Section */}
                  {user.bio && (
                    <div className="mb-6">
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="text-sm font-medium text-gray-500 mb-2">About</div>
                        <p className="text-gray-700 whitespace-pre-line">{user.bio}</p>
                      </div>
                    </div>
                  )}

                  {/* Account Details */}
                  
                </div>
              </div>
            </div>

            {/* Additional Actions Footer */}
           
          </div>
        </div>
      </div>
    </>
  );
}