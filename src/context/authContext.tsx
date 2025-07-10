"use client"
import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/utils/supabase/client'

interface AuthContextType {
  user: User | null
  loading: boolean
  signUp: (email: string, password: string, metadata?: Record<string, any>) => Promise<{ data: any; error: any }>
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>
  signOut: () => Promise<void>
  updateUser: (updates: Record<string, any>) => Promise<{ data: any; error: any }>
  createProfile: (profileData: any) => Promise<{ data: any; error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const signUp = async (email: string, password: string, metadata?: Record<string, any>) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata || {}
      }
    })
    return { data, error }
  }

  const createProfile = async (profileData: any) => {
    try {
      // Check if profile already exists for this user
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', profileData.id)
        .single()
      
      if (existingProfile) {
        console.log('Profile already exists, updating instead of creating new one')
      }
      
      // Create or update profile in profiles table
      const { data: insertedProfile, error: profileError } = await supabase
        .from('profiles')
        .upsert([profileData], {
          onConflict: 'id',
          ignoreDuplicates: false
        })
        .select()
      
      if (profileError) {
        console.error('Profile creation error:', profileError)
        // Update user metadata as fallback with all the data
        const { error: updateError } = await supabase.auth.updateUser({
          data: {
            ...profileData,
            profile_complete: true
          }
        })
        
        if (updateError) {
          console.error('User metadata update error:', updateError)
          return { data: null, error: updateError }
        } else {
          console.log('User metadata updated successfully')
          return { data: { fallback: true }, error: null }
        }
      } else {
        console.log('Profile saved successfully:', insertedProfile)
        
        // Also update auth metadata for consistency
        await supabase.auth.updateUser({
          data: {
            full_name: profileData.full_name,
            avatar_url: profileData.avatar_url,
            profile_complete: true
          }
        })
        return { data: insertedProfile, error: null }
      }
    } catch (error) {
      console.error('Profile creation process error:', error)
      return { data: null, error }
    }
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const updateUser = async (updates: Record<string, any>) => {
  const { data, error } = await supabase.auth.updateUser({
    data: updates
  })
  return { data, error }
}

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    updateUser,
    createProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
