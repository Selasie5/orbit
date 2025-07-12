import React from 'react'
import { ChatRoom } from '@/hooks/useChat'
import { profileData } from '@/data/profileData'

interface ConversationListProps {
  conversations: ChatRoom[]
  currentUserId: string
  selectedConversation: ChatRoom | null
  onSelectConversation: (conversation: ChatRoom) => void
}

const ConversationList = ({
  conversations,
  currentUserId,
  selectedConversation,
  onSelectConversation
}: ConversationListProps) => {
  // Simple helper functions
  const getOtherUserId = (chatRoom: ChatRoom, currentUserId: string) => {
    return chatRoom.user1_id === currentUserId ? chatRoom.user2_id : chatRoom.user1_id
  }

  const getUserProfile = (userId: string) => {
    // Create a simple hash of the userId to map to profileData consistently
    const hashUserId = (id: string) => {
      let hash = 0;
      for (let i = 0; i < id.length; i++) {
        const char = id.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
      }
      return Math.abs(hash) % profileData.length;
    }

    const profileIndex = hashUserId(userId)
    const profile = profileData[profileIndex]
    
    if (profile) {
      return {
        name: profile.name,
        image: profile.profileImage,
        course: profile.course
      }
    }
    
    // Fallback if not found
    return {
      name: `User ${userId.slice(-4)}`,
      image: `https://ui-avatars.com/api/?name=User${userId.slice(-4)}&background=84cc16&color=fff&size=128`,
      course: 'Unknown'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m`
    if (diffHours < 24) return `${diffHours}h`
    if (diffDays < 7) return `${diffDays}d`
    return date.toLocaleDateString()
  }

  if (conversations.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center text-green-600">
          <div className="text-4xl mb-3">🔍</div>
          <h3 className="font-medium mb-2">No conversations yet</h3>
          <p className="text-sm opacity-75">Start swiping to create chats!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-green-900 mb-4">Chats</h2>
        
        <div className="space-y-2">
          {conversations.map((conversation: ChatRoom) => {
            const otherUserId = getOtherUserId(conversation, currentUserId)
            const userProfile = getUserProfile(otherUserId)
            const otherUserName = userProfile.name
            const otherUserImage = userProfile.image
            const preview = 'Start a conversation...' // Default preview
            const timestamp = conversation.created_at
            const hasUnread = false // Simplified for now
            const isSelected = selectedConversation?.id === conversation.id

            return (
              <div
                key={conversation.id}
                onClick={() => onSelectConversation(conversation)}
                className={`
                  p-3 rounded-xl cursor-pointer transition-all duration-200
                  ${isSelected 
                    ? 'bg-lime-100 border-2 border-lime-300' 
                    : 'bg-white/60 hover:bg-white/80 border border-lime-100'
                  }
                  ${hasUnread ? 'ring-2 ring-lime-400/30' : ''}
                `}
              >
                <div className="flex items-center gap-3">
                  {/* Profile Image */}
                  <div className="relative">
                    <img
                      src={otherUserImage}
                      alt={otherUserName}
                      className="w-12 h-12 rounded-full object-cover border-2 border-white"
                      onError={(e) => {
                        // Fallback to generated avatar if image fails to load
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUserName)}&background=84cc16&color=fff&size=128`
                      }}
                    />
                    {hasUnread && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-lime-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>

                  {/* Conversation Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`font-medium truncate ${hasUnread ? 'text-green-900' : 'text-green-800'}`}>
                        {otherUserName}
                      </h3>
                      <span className="text-xs text-green-600 flex-shrink-0">
                        {formatTimestamp(timestamp)}
                      </span>
                    </div>
                    
                    <p className={`text-sm truncate ${hasUnread ? 'text-green-700 font-medium' : 'text-green-600'}`}>
                      {preview}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}


export default ConversationList
