// hooks/useCurrentUser.ts
'use client';

import { useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  avatar?: string;
  bio?: string;
  website?: string;
  role?: string;
  createdAt?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3046';

export const useCurrentUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get email from localStorage
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        setUser(null);
        return;
      }
      
      const { email } = JSON.parse(storedUser);
      
      // Call API to get full user data
      const response = await fetch(`${API_BASE_URL}/api/v1/user/${email}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      
      const data = await response.json();
      setUser(data.user);
      
      // Update localStorage with complete user data
      localStorage.setItem('user', JSON.stringify(data.user));
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching user:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount
  useEffect(() => {
    fetchUser();
  }, []);

  // Manual refresh function
  const refreshUser = async () => {
    await fetchUser();
  };

  return {
    user,
    loading,
    error,
    refreshUser,
  };
};