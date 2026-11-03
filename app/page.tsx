"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { checkIsPhone } from "@/lib/utils";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // 1. Check for existing session
    const token = localStorage.getItem("authToken");
    
    
    if (token) {
      router.replace("/chat"); // Already logged in
      return;
    }

   
    // 2. Robust Device Detection
   const isMobileOrTablet = checkIsPhone();




    // 3. Redirect based on device type
    if (isMobileOrTablet) {
      router.replace("/signup"); // Master Device -> Signup
    } else {
      router.replace("/login");  // Companion Device -> Login
    }
  }, [router]);

  // Loading state while redirecting
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 flex flex-col items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-white border-t-transparent"></div>
      <p className="mt-6 text-white font-medium text-lg tracking-wide">
        Loading secure environment...
      </p>
    </div>
  );
}