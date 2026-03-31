// app/(app)/@conversation/[userId]/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { 
  ChevronLeft, 
  MoreHorizontal, 
  Phone, 
  Video, 
  Heart, 
  Smile, 
  Image as ImageIcon,
  Send,
  Info,
  Check,
  CheckCheck
} from 'lucide-react';

interface Message {
  id: string;
  content: string;
  timestamp: string;
  senderId: string;
  isRead: boolean;
  isLiked?: boolean;
}

interface User {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: string;
}



export default function ConversationPage() {
  return (
    <>
    </>
  )
  
}