'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { z } from 'zod';
import dynamic from 'next/dynamic';
import { toast, Toaster } from 'react-hot-toast';

// Dynamically import Lucide icons
const LinkedinIcon = dynamic(() => import('lucide-react').then(mod => mod.Linkedin), { ssr: false });
const GithubIcon = dynamic(() => import('lucide-react').then(mod => mod.Github), { ssr: false });
const HeartIcon = dynamic(() => import('lucide-react').then(mod => mod.Heart), { ssr: false });

// Define TypeScript interface
type SignUpFormData = {
  name: string;
  username: string;
  email: string;
  password: string;
};

// Schema definition
const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name cannot exceed 50 characters"),
  username: z.string().min(3, "Username must be at least 3 characters").max(30, "Username cannot exceed 30 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    "Password must contain at least one uppercase letter, one lowercase letter, and one number"
  ),
});

export default function SignUpPage() {
  const router = useRouter();
  const [signUpStatus, setSignUpStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
    }
  });

  const onSubmit = async (data: SignUpFormData) => {
    setIsSubmitting(true);
    setSignUpStatus("");
    
    try {
      const res = await axios.post("http://localhost:3046/api/v1/signup", data);
      
      
      setSignUpStatus("Account created successfully! Redirecting to login...");
      
      setTimeout(() => {
        router.push("/login");
      }, 2000);
      
      reset();
      
    } catch (e: any) {
      console.error('❌ Signup error:', e);
      
      if (e.response) {
        const errorMessage = e.response.data?.message || 'Signup failed. Please try again.';
        setSignUpStatus(errorMessage);
      } else if (e.request) {
        setSignUpStatus('No response from server. Check if backend is running.');
      } else {
        setSignUpStatus('Network error. Please check your connection.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 flex flex-col">
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-6 w-full">
        <div className="w-full max-w-md mx-auto">
          {/* Form Card */}
          <div className="border border-white/30 bg-white/10 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center gap-4 md:gap-6 p-4 sm:p-6 md:p-8 shadow-2xl">
            <h1 className="font-semibold text-2xl sm:text-3xl text-white text-center">
              Sign Up
            </h1>
            
            <div className="w-full">
              <form className="flex flex-col gap-3 sm:gap-4" onSubmit={handleSubmit(onSubmit)}>
                {/* Name Field */}
                <div>
                  <input 
                    type="text" 
                    {...register('name')}
                    className="rounded-lg h-10 sm:h-12 px-4 w-full bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm sm:text-base" 
                    placeholder="Full name"
                  />
                  {errors.name && (
                    <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-red-300">{errors.name.message}</p>
                  )}
                </div>
                
                {/* Username Field */}
                <div>
                  <input 
                    type="text" 
                    {...register('username')}
                    className="rounded-lg h-10 sm:h-12 px-4 w-full bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm sm:text-base" 
                    placeholder="Username"
                  />
                  {errors.username && (
                    <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-red-300">{errors.username.message}</p>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <input 
                    type="email" 
                    {...register('email')}
                    className="rounded-lg h-10 sm:h-12 px-4 w-full bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm sm:text-base"  
                    placeholder="Email address"
                  />
                  {errors.email && (
                    <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-red-300">{errors.email.message}</p>
                  )}
                </div>
                
                {/* Password Field */}
                <div>
                  <input 
                    type="password" 
                    {...register('password')}
                    className="rounded-lg h-10 sm:h-12 px-4 w-full bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm sm:text-base"  
                    placeholder="Password"
                  />
                  {errors.password && (
                    <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-red-300">{errors.password.message}</p>
                  )}
                </div>
                
                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg h-10 sm:h-12 px-4 w-full cursor-pointer bg-amber-400 hover:bg-amber-500 disabled:bg-amber-300 text-gray-900 font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-300 text-sm sm:text-base"
                >
                  {isSubmitting ? 'Creating Account...' : 'Sign Up'}
                </button>
              </form>
              
              {/* Login Link */}
              <p className="text-white text-center mt-3 sm:mt-4 text-xs sm:text-sm md:text-base">
                Already have an account?  
                <Link 
                  href="/login"
                  className="text-amber-300 hover:text-amber-200 hover:underline ml-1 transition-colors duration-200"
                >
                  <u>Login</u>
                </Link>
              </p>
            </div>

            {/* Status Message */}
            {signUpStatus && (
              <p className="text-green-300 text-center text-xs sm:text-sm md:text-base mt-2">
                {signUpStatus}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="mt-4 sm:mt-6 md:mt-8 mb-2 sm:mb-4">
            <div className="border-t border-white/20 pt-4 sm:pt-6">
              <div className="flex flex-col items-center space-y-3 sm:space-y-4">
                
                {/* Developer Info */}
                <div className="text-center px-2">
                  <p className="text-white/80 text-xs sm:text-sm mb-1 sm:mb-2">
                    Developed with <HeartIcon className="inline-block w-3 h-3 sm:w-4 sm:h-4 text-red-400 fill-red-400 mx-1" /> by
                  </p>
                  <p className="text-white font-bold text-base sm:text-lg md:text-xl">Suprit Kolse</p>
                  <p className="text-white/70 text-xs sm:text-sm mt-1">Full Stack Developer</p>
                </div>
                
                {/* Social Links */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 md:gap-6 w-full px-2">
                  
                  {/* LinkedIn */}
                  <a 
                    href="https://www.linkedin.com/in/suprit-kolse-17a498205/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group flex items-center space-x-2 text-white hover:text-blue-200 transition-colors duration-200 w-full sm:w-auto justify-center sm:justify-start"
                  >
                    <div className="p-1.5 sm:p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
                      <LinkedinIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs sm:text-sm font-medium">LinkedIn</p>
                      <p className="text-xs text-white/70 group-hover:text-white/90 hidden sm:block">
                        suprit-kolse
                      </p>
                    </div>
                  </a>
                  
                  {/* GitHub */}
                  <a 
                    href="https://github.com/suprit284/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group flex items-center space-x-2 text-white hover:text-purple-200 transition-colors duration-200 w-full sm:w-auto justify-center sm:justify-start"
                  >
                    <div className="p-1.5 sm:p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
                      <GithubIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs sm:text-sm font-medium">GitHub</p>
                      <p className="text-xs text-white/70 group-hover:text-white/90 hidden sm:block">
                        suprit-kolse
                      </p>
                    </div>
                  </a>
                  
                </div>
                
                {/* Quick Links - Mobile Only */}
                <div className="flex flex-col sm:hidden items-center space-y-2 mt-2">
                  <a 
                    href="https://www.linkedin.com/in/suprit-kolse-17a498205/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-white/80 hover:text-white text-xs underline decoration-dotted hover:decoration-solid transition-all"
                  >
                    View LinkedIn Profile
                  </a>
                  <a 
                    href="https://github.com/suprit284/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-white/80 hover:text-white text-xs underline decoration-dotted hover:decoration-solid transition-all"
                  >
                    View GitHub Profile
                  </a>
                </div>
                
                {/* Quick Links - Desktop */}
               
                
                {/* Copyright */}
                <p className="text-white/60 text-xs text-center mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-white/10 px-4">
                  © {new Date().getFullYear()} Suprit Kolse. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}