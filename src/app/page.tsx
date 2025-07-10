"use client"
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push("/auth/login");
  }, [router]);

  return (
    <>
      <div className="flex flex-col justify-center items-center min-h-screen">
       <span className="text-2xl font-bold text-gray-800">
Redirecting to login...
        </span> 
        </div>
    </>
  );
}
