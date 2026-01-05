'use client'; // Add this since we're using hooks

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // Changed from react-router
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import Link from 'next/link'; // Changed from react-router Link
import { formSchema } from '@/lib/utils'; // Adjust path as needed

// Define TypeScript interface
type FormData = {
  name: string;
  email: string;
  password: string;
  username: string;
};

export default function SignupPage() {
  const router = useRouter(); // Changed from useNavigate
  const [signUpStatus, setSignUpStatus] = useState<string>("");
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      username: ""
    }
  });

  const onSubmit = async (data: FormData) => {
    try {
      console.log(data);
      const res = await axios.post("http://localhost:3046/api/v1/signup", data);
      
      setSignUpStatus(res.data.message);
      alert('Signup successful!');
      
      setTimeout(() => {
        router.push("/login"); // Changed from navigate
      }, 1500);
      
      reset();
    } catch (e: any) {
      if (e.response && e.response.status === 400) {
        setSignUpStatus(e.response.data.message);
      } else if (e.response && e.response.status === 500) {
        setSignUpStatus('Server error. Please try again.');
      } else {
        setSignUpStatus('Something went wrong. Please try again.');
      }
      console.log(e.message);
    }
  };

  useEffect(() => {
    let cleanup = setTimeout(() => setSignUpStatus(""), 2000);
    return () => {
      clearTimeout(cleanup);
    };
  }, [signUpStatus]);

  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 min-h-screen flex items-center justify-center p-4">
      <div className='border border-white/30 bg-white/10 backdrop-blur-sm w-full max-w-md rounded-xl flex flex-col items-center justify-center gap-6 p-6 sm:p-8 shadow-2xl'>
        <h1 className='font-semibold text-2xl sm:text-3xl text-white text-center'>Sign Up</h1>
        <div className="w-full">
          <form className='flex flex-col gap-4' onSubmit={handleSubmit(onSubmit)}>
            
            <div>
              <input 
                type='text' 
                {...register('name')}
                className='rounded-lg h-12 px-4 w-full bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50' 
                placeholder='Full name'
              />
              {errors.name && (
                <p className="mt-2 text-sm text-red-300">{errors.name.message}</p>
              )}
            </div>
            
            <div>
              <input 
                type='text' 
                {...register('username')}
                className='rounded-lg h-12 px-4 w-full bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50' 
                placeholder='User name'
              />
              {errors.username && (
                <p className="mt-2 text-sm text-red-300">{errors.username.message}</p>
              )}
            </div>

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
              {isSubmitting ? 'Signing Up...' : 'Sign Up'}
            </button>
          </form>
          
          <p className='text-white text-center mt-4 text-sm sm:text-base'>
            Already signed up?  
            <Link 
              href="/login" // Changed from 'to' to 'href'
              className='text-amber-300 hover:text-amber-200 hover:underline ml-1 transition-colors duration-200'
            >
              <u>Login</u>
            </Link>
          </p>
        </div>

        {signUpStatus && (
          <p className="text-green-300 text-center text-sm sm:text-base mt-2">{signUpStatus}</p>
        )}
      </div>
    </div>
  );
}