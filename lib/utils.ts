import { z } from 'zod';

export const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
});

export const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith(name + '=')) {
      return cookie.substring(name.length + 1);
    }
  }
  return null;
};


export const checkIsPhone = () => {
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  
  // 1. Only check for PHONES (iPhone, Android phones, etc.)
  // Note: We purposefully DO NOT include "ipad" here so iPads go to login.
  if (/android|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent)) {
    
    //  Edge Case: Some Android tablets report "Android" without "Mobile"
    // If the user agent has "Android" but NOT "Mobile", it's likely an Android Tablet.
    if (/android/i.test(userAgent) && !/mobile/i.test(userAgent)) {
      return false; // It's a tablet -> Login
    }
    
    return true; // phone -> Signup
  }
  
  return false; // Everything else (Desktop, Laptop, iPad) -> Login
};