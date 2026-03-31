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


  // Update activeTab when URL changes
  useEffect(() => {
    const segments = pathname.split('/').filter(Boolean);
  const tab = segments[0]; 
    if (tab) {
      setActiveTab(tab);
    }
  }, [pathname]);

  // Handle tab change with navigation
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    router.push(`/${tab}`);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Leftbar 
        activeTab={activeTab}
        onTabChange={handleTabChange}
        
      />
      
      {/* Main Content - Renders children (page.tsx) */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}