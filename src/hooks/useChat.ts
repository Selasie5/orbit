import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useAuth } from '@/context/authContext'

export interface ChatRoom {
  id: string
  user1_id: string
  user2_id: string
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  chat_room_id: string
  sender_id: string
  content: string
  message_type: string
  created_at: string
  read_at?: string
  delivered_at?: string
}

export const useChat = () => {
  const { user } = useAuth()
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  // Fetch all chat rooms for the current user
  const fetchChatRooms = useCallback(async () => {
    if (!user) return

    setLoading(true)
    try {
      const response = await fetch('/api/chat')
      const data = await response.json()
      
      if (response.ok) {
        setChatRooms(data.chatRooms || [])
      } else {
        console.error('Error fetching chat rooms:', data.error)
      }
    } catch (error) {
      console.error('Error fetching chat rooms:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  // Fetch messages for a specific chat room
  const fetchMessages = useCallback(async (chatRoomId: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/chat?chatRoomId=${chatRoomId}`)
      const data = await response.json()
      
      if (response.ok) {
        setMessages(data.messages || [])
      } else {
        console.error('Error fetching messages:', data.error)
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Create or get a chat room with another user
  const createChatRoom = useCallback(async (otherUserId: string): Promise<ChatRoom | null> => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_chat_room',
          otherUserId
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        const chatRoom = data.chatRoom
        // Add to local state if it's new
        setChatRooms(prev => {
          const exists = prev.some(room => room.id === chatRoom.id)
          return exists ? prev : [chatRoom, ...prev]
        })
        return chatRoom
      } else {
        console.error('Error creating chat room:', data.error)
        return null
      }
    } catch (error) {
      console.error('Error creating chat room:', error)
      return null
    }
  }, [])

  // Send a message
  const sendMessage = useCallback(async (chatRoomId: string, content: string): Promise<Message | null> => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_message',
          chatRoomId,
          content
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        const message = data.message
        setMessages(prev => [...prev, message])
        return message
      } else {
        console.error('Error sending message:', data.error)
        return null
      }
    } catch (error) {
      console.error('Error sending message:', error)
      return null
    }
  }, [])

  // Mark messages as read
  const markMessagesAsRead = useCallback(async (chatRoomId: string) => {
    try {
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'mark_read',
          chatRoomId
        })
      })
    } catch (error) {
      console.error('Error marking messages as read:', error)
    }
  }, [])

  // Subscribe to real-time updates
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('chat-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          const newMessage = payload.new as Message
          // Only add message if it's not from current user (to avoid duplicates)
          if (newMessage.sender_id !== user.id) {
            setMessages(prev => {
              // Check if message already exists
              const exists = prev.some(msg => msg.id === newMessage.id)
              return exists ? prev : [...prev, newMessage]
            })
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_rooms'
        },
        (payload) => {
          const updatedRoom = payload.new as ChatRoom
          setChatRooms(prev => 
            prev.map(room => 
              room.id === updatedRoom.id ? updatedRoom : room
            )
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, supabase])

  return {
    chatRooms,
    messages,
    loading,
    fetchChatRooms,
    fetchMessages,
    createChatRoom,
    sendMessage,
    markMessagesAsRead
  }
}
