"use client"
import React, { use } from 'react'
import { useAuth } from '@/context/authContext'
import { useRouter } from 'next/navigation'
const page = () => {
  const { user, loading } = useAuth()
  const router = useRouter();

  React.useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/home');
      } else {
        router.push('/auth/login');
      }
    }
  }, [user, loading, router]);

  return null;
}

export default page
