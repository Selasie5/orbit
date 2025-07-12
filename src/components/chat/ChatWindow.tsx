import React, { useState, useEffect, useRef } from 'react'
import socket from "@/utils/socket";
import { useChat, Message, ChatRoom } from '@/hooks/useChat'
import { useAuth } from '@/context/authContext'
import { ArrowLeftIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';

interface ChatWindowProps {
  chatRoom: ChatRoom
  otherUser: {
    id: string
    name: string
    avatar_url: string
  }
  onBack: () => void
  isMobile: boolean
}

const ChatWindow = ({
  chatRoom,
  otherUser,
  onBack,
  isMobile
}: ChatWindowProps) => {
  const { user } = useAuth()
  const { messages, fetchMessages, sendMessage, markMessagesAsRead } = useChat()
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load messages when component mounts or chat room changes
  useEffect(() => {
    if (chatRoom.id) {
      fetchMessages(chatRoom.id)
      markMessagesAsRead(chatRoom.id)
    }
  }, [chatRoom.id, fetchMessages, markMessagesAsRead])

  // Listen for incoming messages via socket.io
  useEffect(() => {
    const handleReceiveMessage = (messageData: any) => {
      console.log("Received message via socket:", messageData);
      // The useChat hook will handle adding the message via real-time subscription
      // But we can also manually trigger a refresh if needed
      fetchMessages(chatRoom.id)
    };

    socket.on("receive-message", handleReceiveMessage);
    
    // Join the chat with user data
    socket.emit("join-chat", {
      username: user?.email || 'Anonymous',
      userId: user?.id,
      chatRoomId: chatRoom.id
    });

    return () => {
      socket.off("receive-message", handleReceiveMessage);
    };
  }, [chatRoom.id, user, fetchMessages]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    setIsLoading(true);

    try {
      const message = await sendMessage(chatRoom.id, messageContent);
      
      if (message) {
        // Emit to socket for real-time updates
        socket.emit("send-message", {
          message: messageContent,
          chatRoomId: chatRoom.id,
          senderId: user.id
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

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
          src={otherUser.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser.name)}&background=84cc16&color=fff`}
          alt={otherUser.name}
          className="w-10 h-10 rounded-full object-cover border-2 border-lime-200"
        />

        <div>
          <h2 className="font-semibold text-green-900">{otherUser.name}</h2>
          <p className="text-sm text-green-600">Online now</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isCurrentUser = message.sender_id === user?.id
          const isAI = message.sender_id === 'AI-Assistant'

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
                  {formatTimestamp(message.created_at)}
                </div>
              </div>

              {/* Avatar for other user */}
              {!isCurrentUser && !isAI && (
                <img
                  src={otherUser.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser.name)}&background=84cc16&color=fff`}
                  alt={otherUser.name}
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
            placeholder={`Message ${otherUser.name}...`}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-white border border-lime-200 rounded-full focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent disabled:opacity-50"
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isLoading}
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
