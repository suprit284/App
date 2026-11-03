// components/ConnectionStatusIndicator.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { getCookie } from '@/lib/utils';

export const ConnectionStatusIndicator = React.memo(() => {
  // ✅ Subscribe to connection status
  const { isConnected, connect, disconnect } = useWebSocket();
  const hasConnected = useRef(false);
  const [isInitializing, setIsInitializing] = useState(true);

  console.log('🔄 ConnectionStatusIndicator re-rendered');

  // ✅ WebSocket connection logic lives HERE
  useEffect(() => {
    console.log('🔵 ConnectionStatusIndicator mounted');
    
    const token = getCookie("token");
    console.log(`   token exists: ${!!token}`);
    
    if (token && !hasConnected.current) {
      console.log('🔌 Initializing WebSocket connection from ConnectionStatusIndicator...');
      hasConnected.current = true;
      connect(token);
      
      setIsInitializing(false);
    } else if (!token) {
      console.log('⏭️ No token found, skipping WebSocket connection');
      setIsInitializing(false);
    }
    console.log("1st render",isConnected);
    // Cleanup
    return () => {
      console.log('🔴 ConnectionStatusIndicator unmounting');
      
      if (hasConnected.current) {
        console.log(isConnected,"here is the value")
        console.log('🔌 Disconnecting WebSocket...');
        
        hasConnected.current = false;
      }
    };
  }, [connect]); // ✅ Only runs on mount
  console.log("this is the final render",isConnected);

  
  // Show connecting state while initializing
  if (isInitializing) {
    return (
      <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-yellow-50">
        <div className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full rounded-full bg-yellow-500 opacity-75 animate-ping" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500" />
        </div>
        <span className="text-xs font-medium text-yellow-600">
          Connecting...
        </span>
      </div>
    );
  }

  // ✅ Show connection status
  return (
    <div className={`flex items-center gap-2 px-2 py-1 rounded-full ${
      isConnected ? 'bg-green-50' : 'bg-gray-50'
    }`}>
      <div className="relative flex h-2 w-2">
        {isConnected && (
          <span className="absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75 animate-ping" />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${
          isConnected ? 'bg-green-500' : 'bg-gray-400'
        }`} />
      </div>
      <span className={`text-xs font-medium ${
        isConnected ? 'text-green-600' : 'text-gray-500'
      }`}>
        {isConnected ? 'Live' : 'Offline'}
      </span>
    </div>
  );
});

ConnectionStatusIndicator.displayName = 'ConnectionStatusIndicator';