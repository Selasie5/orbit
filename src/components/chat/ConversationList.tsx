import React from 'react'
import { Conversation, Message } from '@/types/chat'
import { profileData } from '@/data/profileData'
import { 
  getOtherUserId, 
  getUserDisplayName, 
  getUserProfileImage, 
  formatTimestamp, 
  generateConversationPreview,
  sortConversationsByLastMessage,
  hasUnreadMessages
} from '@/actions/swipe/swipeRight'

interface ConversationListProps {
  conversations: Conversation[]
  messages: Message[]
  currentUserId: string
  selectedConversation: Conversation | null
  onSelectConversation: (conversation: Conversation) => void
}

const ConversationList = ({
  conversations,
  messages,
  currentUserId,
  selectedConversation,
  onSelectConversation
}: ConversationListProps) => {
  const sortedConversations = sortConversationsByLastMessage(conversations)

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
          {sortedConversations.map((conversation) => {
            const otherUserId = getOtherUserId(conversation, currentUserId)
            const otherUserName = getUserDisplayName(otherUserId, profileData)
            const otherUserImage = getUserProfileImage(otherUserId, profileData)
            const preview = generateConversationPreview(conversation.lastMessage)
            const timestamp = conversation.lastMessage?.timestamp || conversation.createdAt
            const hasUnread = hasUnreadMessages(conversation.id, currentUserId, messages)
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