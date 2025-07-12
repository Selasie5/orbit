"use client"
import React, { useEffect } from 'react'
import SwipeCards from "@/components/ui/SwipeCards";
import { useAuth } from "@/context/authContext";
import { useRouter } from 'next/navigation';
import { ChatBubbleLeftRightIcon, UserCircleIcon, ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";
import Link from 'next/link';

const page = () => {
  const { user, profile, loading, signOut } = useAuth();
  const router = useRouter();

  console.log('Home page render - Auth state:', { 
    hasUser: !!user, 
    hasProfile: !!profile, 
    loading,
    userId: user?.id 
  });

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Protect the route - redirect if not authenticated
  useEffect(() => {
    console.log('Auth effect triggered:', { loading, hasUser: !!user });
    
    if (!loading) {
      if (!user) {
        console.log('No user found, redirecting to login');
        router.push('/auth/login');
      } else {
        console.log('User authenticated, staying on home page');
      }
    }
  }, [user?.id, loading, router]); // Use user.id instead of user object to prevent reference changes

  // Remove the API fetch useEffect - let SwipeCards handle this when user clicks the button

  // Show loading while checking auth
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

  // Don't render if no user (will redirect)
  if (!user) {
    return null;
  }


  console.log('Current user:', user);
  console.log('Current profile:', profile);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-6 bg-gradient-to-r from-slate-50 to-white border-b border-gray-200/50">
        <div className="flex items-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-lime-600 to-green-600 bg-clip-text text-transparent">
            Orbit
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Profile button */}
          <Link 
            href="/auth/signup/profile" 
            className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95"
          >
            <UserCircleIcon className="w-6 h-6 text-white" />
          </Link>
          
          {/* Chat button */}
          <Link 
            href="/chat" 
            className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-lime-500 to-green-600 hover:from-lime-600 hover:to-green-700 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95"
          >
            <ChatBubbleLeftRightIcon className="w-6 h-6 text-white" />
          </Link>

          {/* Logout button */}
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95"
            title="Logout"
          >
            <ArrowRightOnRectangleIcon className="w-6 h-6 text-white" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center items-center">
        <SwipeCards />
      </div>
    </div>
  )
}

export default page
