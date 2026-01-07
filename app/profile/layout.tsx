'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Leftbar from '../components/Leftbar';
  



export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {

    
  const router = useRouter();
  const pathname = usePathname();
  
  // Extract current tab from pathname
  const currentTab = pathname.split('/').pop() || 'profile';
  const [activeTab, setActiveTab] = useState(currentTab);
  
  // Mock user data (replace with actual user from context/store)
  const user = {
    name: 'John Doe',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    email: 'john@example.com'
  };

  // Update activeTab when URL changes
  useEffect(() => {
    const tab = pathname.split('/').pop();
    if (tab) {
      setActiveTab(tab);
    }
  }, [pathname]);

  // Handle tab change with navigation
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    router.push(`/profile/${tab}`);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Leftbar 
        activeTab={activeTab}
        onTabChange={handleTabChange}
        user={user}
      />
      
      {/* Main Content - Renders children (page.tsx) */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}