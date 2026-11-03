"use client";
import { useRouter } from 'next/navigation';
import { Send } from 'lucide-react';

export default function MessagesPage() {
  const router = useRouter();
  
  return (
    <>
      {/* Desktop Empty State */}
      <div className="hidden lg:flex flex-col items-center justify-center h-full text-center p-8">
        <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-200 to-purple-200 flex items-center justify-center">
            <Send className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Your Messages</h3>
        <p className="text-gray-500 mb-6 max-w-md">
          Send private messages to a friend or group. Select a conversation from the left to get started.
        </p>
        <button 
          onClick={() => router.push('/search')}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full hover:shadow-lg transition-shadow"
        >
          Find People to Chat With
        </button>
      </div>

      
      
    </>
  );
}