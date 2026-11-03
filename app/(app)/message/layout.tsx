// app/message/layout.tsx
'use client';

import ConversationList from '@/app/components/ConversationList';

export default function MessageLayout({ children }: { children: React.ReactNode }) {
  // ✅ No duplicate fetch here - ConversationList handles it
  return (
    <div className="flex h-screen bg-gray-50">
      <ConversationList initialConversations={[]} />
      <div className="flex-1 flex flex-col bg-white">
        {children}
      </div>
    </div>
  );
}