import React, { useState, useEffect, useRef } from 'react'
import socket from "@/utils/socket";
import { Conversation, Message } from '@/types/chat'
import { profileData } from '@/data/profileData'
import { getMessagesByConversation, addMessage } from '@/data/chatData'
import {
  getOtherUserId,
  getUserDisplayNameFromConversation,
  getUserProfileImageFromConversation,
  formatTimestamp
} from '@/actions/swipe/swipeRight'
import { ArrowLeftIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline'

interface ChatWindowProps {
  conversation: Conversation
  messages: Message[]
  currentUserId: string
  onBack: () => void
  isMobile: boolean
}

const ChatWindow = ({
  conversation,
  messages,
  currentUserId,
  onBack,
  isMobile
}: ChatWindowProps) => {
  const [newMessage, setNewMessage] = useState('')
  const [conversationMessages, setConversationMessages] = useState<Message[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const otherUserId = getOtherUserId(conversation, currentUserId)
  const otherUserName = getUserDisplayNameFromConversation(conversation, currentUserId, profileData)
  const otherUserImage = getUserProfileImageFromConversation(conversation, currentUserId, profileData)

  // Listen for incoming messages via socket.io
  useEffect(() => {
  const handleReceiveMessage = (msg: Message) => {
    console.log("Received message via socket:", msg); // <-- Add this
    if (msg.conversationId === conversation.id && msg.senderId !== currentUserId) {
      setConversationMessages((prev) => [...prev, msg]);
    }
  };
  socket.on("receive-message", handleReceiveMessage);
  return () => {
    socket.off("receive-message", handleReceiveMessage);
  };
}, [conversation.id, currentUserId]);

  // Load messages for this conversation
  useEffect(() => {
    const msgs = getMessagesByConversation(conversation.id)
    setConversationMessages(msgs)
    // Messages can be marked as read in the parent component if needed
  }, [conversation.id, currentUserId])

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversationMessages])

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const messageContent = newMessage.trim();
    setNewMessage('');

    const message: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      conversationId: conversation.id,
      senderId: currentUserId,
      content: messageContent,
      timestamp: new Date(),
      isRead: false,
      isIcebreaker: false
    };

    addMessage(message);

    socket.emit("send-message", message);

    setConversationMessages(prev => [...prev, message]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-lime-200 px-4 py-3 flex items-center gap-3">
        {isMobile && (
          <button
            onClick={onBack}
            className="p-2 hover:bg-lime-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 text-lime-700" />
          </button>
        )}

        <img
          src={otherUserImage}
          alt={otherUserName}
          className="w-10 h-10 rounded-full object-cover border-2 border-lime-200"
        />

        <div>
          <h2 className="font-semibold text-green-900">{otherUserName}</h2>
          <p className="text-sm text-green-600">Online now</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {conversationMessages.map((message) => {
          const isCurrentUser = message.senderId === currentUserId
          const isAI = message.senderId === 'AI-Assistant'

          return (
            <div
              key={message.id}
              className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs lg:max-w-md ${isCurrentUser ? 'order-2' : 'order-1'}`}>
                {/* Message Bubble */}
                <div
                  className={`
                    px-4 py-2 rounded-2xl
                    ${isCurrentUser
                      ? 'bg-lime-500 text-white'
                      : isAI
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                        : 'bg-white text-green-900 border border-lime-200'
                    }
                  `}
                >
                  {isAI && (
                    <div className="text-xs opacity-75 mb-1">🤖 AI Networking Icebreaker</div>
                  )}
                  <p className="text-sm">{message.content}</p>
                </div>

                {/* Timestamp */}
                <div className={`text-xs text-green-600 mt-1 ${isCurrentUser ? 'text-right' : 'text-left'}`}>
                  {formatTimestamp(message.timestamp)}
                </div>
              </div>

              {/* Avatar for other user */}
              {!isCurrentUser && !isAI && (
                <img
                  src={otherUserImage}
                  alt={otherUserName}
                  className="w-8 h-8 rounded-full object-cover order-1 mr-2 mt-auto"
                />
              )}
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white/80 backdrop-blur-sm border-t border-lime-200 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Message ${otherUserName}...`}
            className="flex-1 px-4 py-2 bg-white border border-lime-200 rounded-full focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent"
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="p-2 bg-lime-500 text-white rounded-full hover:bg-lime-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatWindow