import { useState, useEffect } from "react";

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const checkIsPhone = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      
      if (/android|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent)) {
        // Exclude Android tablets
        if (/android/i.test(userAgent) && !/mobile/i.test(userAgent)) {
          return false; 
        }
        return true; // It's a phone
      }
      return false; // Desktop, Laptop, iPad
    };

    setIsMobile(checkIsPhone());
  }, []);

  return isMobile;
}