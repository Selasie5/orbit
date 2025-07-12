"use client"
import React, { useEffect } from 'react'
import { useAuth } from '@/context/authContext'
import { useRouter } from 'next/navigation'

const page = () => {
  const { user, loading } = useAuth()
  const router = useRouter();

  useEffect(() => {
    console.log('Root page - Auth state:', { user: !!user, loading });
    
    if (!loading) {
      if (user) {
        console.log('User authenticated, redirecting to /home');
        router.push('/home'); // Use replace instead of push to avoid back button issues
      } else {
        console.log('No user found, redirecting to /auth/login');
        router.push('/auth/login'); // Use replace instead of push
      }
    }
  }, [user, loading, router]); // Use user.id instead of user object

  // Show loading while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-lime-50 to-green-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Return null after redirect logic
  return null;
}

export default page
