// app/(app)/@conversation/default.tsx
'use client';

import { MessageCircle, Heart } from 'lucide-react';

export default function DefaultConversation() {
  return (
    <div className="h-full flex flex-col items-center justify-center bg-white">
      {/* Instagram-style empty state */}
      <div className="max-w-md w-full px-6 py-12 text-center">
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center">
            <MessageCircle className="w-12 h-12 text-white" strokeWidth={1.5} />
          </div>
        </div>
        
        {/* Title */}
        <h2 className="text-2xl font-light text-gray-800 mb-3">
          Your Messages
        </h2>
        
        {/* Description */}
        <p className="text-gray-500 mb-8 text-sm leading-relaxed">
          Send private photos and messages to a friend or group
        </p>
        
        {/* Action Button */}
        <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 shadow-md">
          Send Message
        </button>
        
        {/* Inspiration text */}
        <div className="mt-12 flex items-center justify-center gap-2 text-gray-400 text-sm">
          <Heart className="w-4 h-4" fill="#9CA3AF" />
          <span>Your conversations will appear here</span>
          <Heart className="w-4 h-4" fill="#9CA3AF" />
        </div>
      </div>
    </div>
  );
}