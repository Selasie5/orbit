"use client"
import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/utils/supabase/client'

interface AuthContextType {
  user: User | null
  profile: any | null
  loading: boolean
  signUp: (email: string, password: string, metadata?: Record<string, any>) => Promise<{ data: any; error: any }>
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>
  signOut: () => Promise<void>
  updateUser: (updates: Record<string, any>) => Promise<{ data: any; error: any }>
  createProfile: (profileData: any) => Promise<{ data: any; error: any }>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  // Function to load profile data
  const loadProfile = async (userId: string) => {
    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (error) {
        console.error('Error loading profile:', error)
        // If profile doesn't exist in table, try to get from user metadata
        const { data: { user: currentUser } } = await supabase.auth.getUser()
        if (currentUser?.user_metadata) {
          setProfile(currentUser.user_metadata)
        }
      } else {
        console.log('Profile loaded successfully:', profileData)
        setProfile(profileData)
      }
    } catch (error) {
      console.error('Profile loading error:', error)
    }
  }

  const refreshProfile = async () => {
    if (user?.id) {
      await loadProfile(user.id)
    }
  }

  useEffect(() => {
    console.log('AuthContext: Starting auth initialization');
    
    // Get initial session
    const getSession = async () => {
      console.log('AuthContext: Getting initial session');
      const { data: { session } } = await supabase.auth.getSession()
      const currentUser = session?.user ?? null
      console.log('AuthContext: Initial session result:', { hasUser: !!currentUser, userId: currentUser?.id });
      
      setUser(currentUser)
      
      // Load profile if user exists
      if (currentUser?.id) {
        console.log('AuthContext: Loading profile for user:', currentUser.id);
        await loadProfile(currentUser.id)
      } else {
        console.log('AuthContext: No user, clearing profile');
        setProfile(null)
      }
      
      console.log('AuthContext: Setting loading to false');
      setLoading(false)
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AuthContext: Auth state change:', { event, hasUser: !!session?.user });
        const currentUser = session?.user ?? null
        setUser(currentUser)
        
        // Load profile if user exists, clear if not
        if (currentUser?.id) {
          await loadProfile(currentUser.id)
        } else {
          setProfile(null)
        }
        
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
        
        // Update the profile state with the new data
        setProfile(insertedProfile[0])
        
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
    // Clear profile data on logout
    setProfile(null)
  }

  const updateUser = async (updates: Record<string, any>) => {
  const { data, error } = await supabase.auth.updateUser({
    data: updates
  })
  return { data, error }
}

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateUser,
    createProfile,
    refreshProfile
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
