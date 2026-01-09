'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { z } from 'zod';

// Dynamically import Lucide icons
import dynamic from 'next/dynamic';
const LinkedinIcon = dynamic(() => import('lucide-react').then(mod => mod.Linkedin), { ssr: false });
const GithubIcon = dynamic(() => import('lucide-react').then(mod => mod.Github), { ssr: false });
const HeartIcon = dynamic(() => import('lucide-react').then(mod => mod.Heart), { ssr: false });

// Define TypeScript interface
type LoginFormData = {
  email: string;
  password: string;
};


const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3046';
// Schema definition
const loginSchema = z.object({  
  email: z.string().email("Email is required"),
  password: z.string().min(1, "Password is required"),
});

export default function LoginPage() {
  const router = useRouter();
  const [loginStatus, setLoginStatus] = useState("");
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    }
  });

  const onSubmit = async (data: LoginFormData) => {
    
    
    try {
      const res = await axios.post(`${API_BASE_URL}/api/v1/login`, data, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true //
      });
      
      
      
      // Success case
      setLoginStatus(res.data.message);
    //   toast.success("Login successful!");
      
      
      localStorage.setItem('user', JSON.stringify(res.data.user));

      
    
      
       setTimeout(() => {
      router.push("/profile");
    }, 5000);
      reset();
      
    } catch (e: any) {
   
      
      // Handle different error cases
      if (e.response) {
   
        
        switch (e.response.status) {
          case 404:
            setLoginStatus(e.response.data.message || 'User not found');
            break;
          case 401:
            setLoginStatus(e.response.data.message || 'Wrong password');
            break;
          case 400:
            setLoginStatus(e.response.data.message || 'Bad request');
            break;
          case 500:
            setLoginStatus('Server error. Please try again.');
            break;
          default:
            setLoginStatus(e.response.data?.message || e.response.data);
        }
      } else if (e.request) {
        
        setLoginStatus('No response from server. Check if backend is running.');
      } else {
        
        setLoginStatus('Network error. Please check your connection.');
      }
    }
  };
  
  useEffect(() => {
    let cleanup = setTimeout(() => setLoginStatus(""), 2000);
    return () => {
      clearTimeout(cleanup);
    };
  }, [loginStatus]);

  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 min-h-screen flex flex-col items-center justify-between p-4">
      {/* Main Content */}
      <div className="flex flex-col items-center justify-center flex-1 w-full">
        <div className='border border-white/30 bg-white/10 backdrop-blur-sm w-full max-w-md rounded-xl flex flex-col items-center justify-center gap-6 p-6 sm:p-8 shadow-2xl'>
          <h1 className='font-semibold text-2xl sm:text-3xl text-white text-center'>Login</h1>
          <div className="w-full">
            <form className='flex flex-col gap-4' onSubmit={handleSubmit(onSubmit)}>
              <div>
                <input 
                  type='email' 
                  {...register('email')}
                  className='rounded-lg h-12 px-4 w-full bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50'  
                  placeholder='Email address'
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-red-300">{errors.email.message}</p>
                )}
              </div>
              
              <div>
                <input 
                  type='password' 
                  {...register('password')}
                  className='rounded-lg h-12 px-4 w-full bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50'  
                  placeholder='Password'
                />
                {errors.password && (
                  <p className="mt-2 text-sm text-red-300">{errors.password.message}</p>
                )}
              </div>
              
              <button
                type='submit'
                disabled={isSubmitting}
                className='rounded-lg h-12 px-4 w-full cursor-pointer bg-amber-400 hover:bg-amber-500 disabled:bg-amber-300 text-gray-900 font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-300'
              >
                {isSubmitting ? 'Logging in...' : 'Login'}
              </button>
            </form>
            
            <p className='text-white text-center mt-4 text-sm sm:text-base'>
              Haven't signed up?  
              <Link 
                href="/signup"
                className='text-amber-300 hover:text-amber-200 hover:underline ml-1 transition-colors duration-200'
              >
                <u>Sign up</u>
              </Link>
            </p>
          </div>

          {loginStatus && (
            <p className="text-green-300 text-center text-sm sm:text-base mt-2">{loginStatus}</p>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full max-w-md mt-8 mb-4">
        <div className="border-t border-white/20 pt-6">
          <div className="flex flex-col items-center space-y-4">
            
            {/* Developer Info */}
            <div className="text-center">
              <p className="text-white/80 text-sm mb-2">
                Developed with <HeartIcon className="inline-block w-4 h-4 text-red-400 fill-red-400 mx-1" /> by
              </p>
              <p className="text-white font-bold text-lg">Suprit Kolse</p>
              <p className="text-white/70 text-sm mt-1">Full Stack Developer</p>
            </div>
            
            {/* Social Links */}
            <div className="flex items-center justify-center space-x-6">
              
              {/* LinkedIn */}
              <a 
                href="https://www.linkedin.com/in/suprit-kolse-17a498205/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group flex items-center space-x-2 text-white hover:text-blue-200 transition-colors duration-200"
              >
                <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
                  <LinkedinIcon className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium">LinkedIn</p>
                  <p className="text-xs text-white/70 group-hover:text-white/90">suprit-kolse</p>
                </div>
              </a>
              
              {/* GitHub */}
              <a 
                href="https://github.com/suprit284/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group flex items-center space-x-2 text-white hover:text-purple-200 transition-colors duration-200"
              >
                <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
                  <GithubIcon className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium">GitHub</p>
                  <p className="text-xs text-white/70 group-hover:text-white/90">suprit-kolse</p>
                </div>
              </a>
              
            </div>
            
           
            
            {/* Copyright */}
            <p className="text-white/60 text-xs text-center mt-4 pt-4 border-t border-white/10">
              © {new Date().getFullYear()} Suprit Kolse. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}