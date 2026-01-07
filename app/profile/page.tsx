'use client';

import { useState, useEffect } from 'react';
import { Mail, User as UserIcon, AlertCircle } from 'lucide-react';
import Image from 'next/image';

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

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<User | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Fetch user data on component mount
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
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
      const response = await fetch(`http://localhost:3046/api/v1/user/${userEmail}`, {
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
        // Update localStorage with fresh data
        localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        throw new Error(data.error || 'Failed to get user data');
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Failed to fetch user:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editedUser || !user) return;

    // Basic validation
    if (!editedUser.name.trim()) {
      setUpdateError('Name is required');
      return;
    }

    if (!editedUser.username.trim()) {
      setUpdateError('Username is required');
      return;
    }

    if (editedUser.name.length < 2) {
      setUpdateError('Name must be at least 2 characters');
      return;
    }

    if (editedUser.username.length < 3) {
      setUpdateError('Username must be at least 3 characters');
      return;
    }

    // Check if anything actually changed
    if (editedUser.name === user.name && editedUser.username === user.username) {
      setIsEditing(false);
      return;
    }

    try {
      setSaveLoading(true);
      setUpdateError(null);
      setUpdateSuccess(false);

      // Call API to update user
      const response = await fetch(`http://localhost:3046/api/v1/users/${user.email}`, {
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

      if (!response.ok) {
        throw new Error(data.error || `Update failed: ${response.status}`);
      }

      if (data.success) {
        setUser(data.user);
        setEditedUser(data.user);
        setIsEditing(false);
        setUpdateSuccess(true);
        
        // Update localStorage
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Clear success message after 3 seconds
        setTimeout(() => setUpdateSuccess(false), 3000);
      } else {
        throw new Error(data.error || 'Update failed');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Update failed';
      setUpdateError(errorMessage);
      console.error('Update error:', err);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setEditedUser({ ...user });
    }
    setIsEditing(false);
    setUpdateError(null);
    setUpdateSuccess(false);
  };

  const handleInputChange = (field: keyof User, value: string) => {
    if (editedUser) {
      setEditedUser({
        ...editedUser,
        [field]: value
      });
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="flex items-center justify-center text-red-600 mb-4">
            <AlertCircle className="w-8 h-8 mr-2" />
            <span>Error: {error}</span>
          </div>
          <button
            onClick={fetchUserData}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">No user data available. Please login.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Success Message */}
        {updateSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center text-green-700">
            <span className="flex-1">Profile updated successfully!</span>
            <button onClick={() => setUpdateSuccess(false)} className="text-green-700 hover:text-green-800">
              ✕
            </button>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-8 md:space-y-0">
            
            {/* Left: Profile Picture */}
            <div className="relative group md:mr-12">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-xl overflow-hidden">
                {user.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={user.name}
                    width={160}
                    height={160}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white text-5xl font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Profile Info */}
            <div className="flex-1 space-y-6">
              {/* Name & Edit Button */}
              <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
                <div className="space-y-2">
                  <div>
                    {isEditing ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Name
                          </label>
                          <input
                            type="text"
                            value={editedUser?.name || ''}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            className="w-full md:w-80 px-4 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter your name"
                            maxLength={50}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            {editedUser?.name?.length || 0}/50 characters
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Username
                          </label>
                          <input
                            type="text"
                            value={editedUser?.username || ''}
                            onChange={(e) => handleInputChange('username', e.target.value)}
                            className="w-full md:w-80 px-4 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter username"
                            maxLength={30}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            {editedUser?.username?.length || 0}/30 characters
                          </p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                          {user.name}
                        </h1>
                        <div className="flex items-center space-x-2 mt-2">
                          <UserIcon className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-600 font-medium">
                            @{user.username}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Edit/Save Buttons */}
                <div className="flex items-center space-x-3">
                  {isEditing ? (
                    <>
                      <button 
                        onClick={handleSave}
                        disabled={saveLoading}
                        className={`px-6 py-2 rounded-lg transition-colors ${
                          saveLoading 
                            ? 'bg-blue-400 cursor-not-allowed' 
                            : 'bg-blue-500 hover:bg-blue-600'
                        } text-white font-medium`}
                      >
                        {saveLoading ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button 
                        onClick={handleCancel}
                        disabled={saveLoading}
                        className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={() => setIsEditing(true)} 
                      className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity font-medium shadow-md"
                    >
                      Edit Profile
                    </button>
                  )}
                </div>
              </div>

              {/* Error Message */}
              {updateError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
                  <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                  <span className="text-sm">{updateError}</span>
                </div>
              )}

              {/* Email */}
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <Mail className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <div>
                  <div className="text-sm text-gray-500">Email</div>
                  <div className="text-gray-900 font-medium break-all">{user.email}</div>
                </div>
              </div>

              {/* Bio */}
              {user.bio && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500 mb-2">Bio</div>
                  <p className="text-gray-700">{user.bio}</p>
                </div>
              )}

              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}