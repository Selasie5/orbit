"use client"
import SwipeCards from "@/components/ui/SwipeCards";
import { useAuth } from "@/context/authContext";

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
      <div className="flex flex-col justify-center items-center min-h-screen">
        <SwipeCards />
      </div>
    </>
  );
}