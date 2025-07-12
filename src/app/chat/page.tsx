"use client"
import React, { useState, useEffect } from 'react'
import { useAuth } from '@/context/authContext'
import { useRouter } from 'next/navigation'
import { useChat, ChatRoom } from '@/hooks/useChat'
import ChatWindow from '@/components/chat/ChatWindow'
import { ArrowLeftIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import ConversationList from '@/components/chat/ConversationList'
import { profileData } from '@/data/profileData'
const ChatPage = () => {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const { chatRooms, messages, fetchChatRooms } = useChat()
  const [selectedChatRoom, setSelectedChatRoom] = useState<ChatRoom | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  // Handle logout
  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await signOut();
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoggingOut(false);
    }
  };

  // Check if user is authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  // Load chat rooms
  useEffect(() => {
    if (user?.id) {
      fetchChatRooms()
    }
  }, [user, fetchChatRooms])

  // Handle mobile responsiveness
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Handle selected chat room and get other user
  const selectedOtherUser = selectedChatRoom ? (() => {
    const otherUserId = selectedChatRoom.user1_id === user?.id ? selectedChatRoom.user2_id : selectedChatRoom.user1_id
    
    // Create a consistent hash of the userId to map to profileData
    const hashUserId = (id: string) => {
      let hash = 0;
      for (let i = 0; i < id.length; i++) {
        const char = id.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
      }
      return Math.abs(hash) % profileData.length;
    }

    const profileIndex = hashUserId(otherUserId)
    const profile = profileData[profileIndex]
    
    if (profile) {
      return {
        id: otherUserId,
        name: profile.name,
        avatar_url: profile.profileImage
      }
    }
    
    // Fallback if profile not found
    return {
      id: otherUserId,
      name: `User ${otherUserId.slice(-4)}`,
      avatar_url: `https://ui-avatars.com/api/?name=User${otherUserId.slice(-4)}&background=84cc16&color=fff&size=128`
    }
  })() : null

  // Show loading while authenticating
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-lime-50 to-green-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-600 mx-auto mb-4"></div>
          <p className="text-green-700">Loading chats...</p>
        </div>
      </div>
    )
  }

  // Don't render if not authenticated
  if (!user) return null

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-lime-50 to-green-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-lime-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/home" 
            className="p-2 hover:bg-lime-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 text-lime-700" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-green-900">Messages</h1>
            <p className="text-sm text-green-600">{chatRooms.length} conversations</p>
          </div>
        </div>
        
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white rounded-lg transition-colors text-sm font-medium"
        >
          <ArrowRightOnRectangleIcon className="h-4 w-4" />
          {loggingOut ? 'Signing out...' : 'Logout'}
        </button>
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 flex overflow-hidden">
        {/* Conversation List - Hidden on mobile when chat is selected */}
        <div className={`
          ${isMobile ? (selectedChatRoom ? 'hidden' : 'flex') : 'flex'} 
          w-full md:w-1/3 lg:w-1/4 bg-white/60 backdrop-blur-sm border-r border-lime-200
        `}>
          <ConversationList
            conversations={chatRooms}
            currentUserId={user.id}
            selectedConversation={selectedChatRoom}
            onSelectConversation={setSelectedChatRoom}
          />
        </div>

        {/* Chat Window - Hidden on mobile when no chat is selected */}
        <div className={`
          ${isMobile ? (selectedChatRoom ? 'flex' : 'hidden') : 'flex'} 
          flex-1 bg-white/40 backdrop-blur-sm
        `}>
          {selectedChatRoom && selectedOtherUser ? (
            <ChatWindow
              chatRoom={selectedChatRoom}
              otherUser={selectedOtherUser}
              onBack={() => setSelectedChatRoom(null)}
              isMobile={isMobile}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-green-600">
                <div className="text-6xl mb-4">💬</div>
                <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
                <p className="text-sm opacity-75">Choose a chat to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ChatPage
