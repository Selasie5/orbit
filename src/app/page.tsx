"use client"
import SwipeCards from "@/components/ui/SwipeCards";
import { useAuth } from "@/context/authContext";
import { ChatBubbleLeftRightIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <span className="text-2xl font-bold text-gray-800">
          Loading...
        </span>
      </div>
    );
  }

  // Middleware handles redirects, so if we're here, user is authenticated
  return (
    <>
      <div className="flex flex-col min-h-screen">
        {/* Header */}
        <header className="flex items-center justify-between px-8 py-6 bg-gradient-to-r from-slate-50 to-white border-b border-gray-200/50">
          <div className="flex items-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-lime-600 to-green-600 bg-clip-text text-transparent">
              Orbit
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <Link 
              href="/auth/signup/profile" 
              className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95"
            >
              <UserCircleIcon className="w-6 h-6 text-white" />
            </Link>
            
            <Link 
              href="/chat" 
              className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-lime-500 to-green-600 hover:from-lime-600 hover:to-green-700 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95"
            >
              <ChatBubbleLeftRightIcon className="w-6 h-6 text-white" />
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex flex-col justify-center items-center">
          <SwipeCards />
        </div>
      </div>
    </>
  );
}