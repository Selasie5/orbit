'use client'

import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { formatTimestamp } from '@/actions/swipe/swipeRight'
import { CheckCheck, Check } from 'lucide-react'

interface Message {
  id: string
  content: string
  message_type: string
  created_at: string
  sender_id: string
  read_at?: string
  delivered_at?: string
  sender: {
    id: string
    full_name: string
    avatar_url?: string
  }
}

interface MessageListProps {
  messages: Message[]
  currentUserId?: string
  loading?: boolean
  onRetry?: () => void
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUserId,
  loading,
  onRetry
}) => {
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-muted-foreground">Loading messages...</div>
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p>No messages yet</p>
          <p className="text-sm">Start the conversation!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => {
        const isOwnMessage = message.sender_id === currentUserId
        const isFileMessage = message.message_type === 'file' || message.message_type === 'image'
        
        return (
          <div
            key={message.id}
            className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
              {!isOwnMessage && (
                <Avatar className="h-6 w-6">
                  <AvatarImage src={message.sender.avatar_url} />
                  <AvatarFallback>
                    {message.sender.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
              )}
              
              <Card className={`p-3 ${isOwnMessage ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                {isFileMessage ? (
                  <FileMessageContent message={message} />
                ) : (
                  <p className="text-sm">{message.content}</p>
                )}
                
                <div className={`flex items-center justify-between mt-1 text-xs ${isOwnMessage ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                  <span>{formatTimestamp(new Date(message.created_at))}</span>
                  {isOwnMessage && (
                    <div className="flex items-center space-x-1">
                      {message.read_at ? (
                        <CheckCheck className="h-3 w-3" />
                      ) : message.delivered_at ? (
                        <Check className="h-3 w-3" />
                      ) : null}
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        )
      })}
    </div>
  )
}

const FileMessageContent: React.FC<{ message: Message }> = ({ message }) => {
  try {
    const fileInfo = JSON.parse(message.content)
    const isImage = message.message_type === 'image'
    
    return (
      <div className="space-y-2">
        {isImage ? (
          <img 
            src={fileInfo.fileUrl} 
            alt={fileInfo.fileName}
            className="max-w-full h-auto rounded"
          />
        ) : (
          <div className="flex items-center space-x-2">
            <div className="text-sm">
              <p className="font-medium">{fileInfo.fileName}</p>
              <p className="text-xs opacity-70">
                {(fileInfo.fileSize / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
        )}
        <a 
          href={fileInfo.fileUrl} 
          download={fileInfo.fileName}
          className="text-xs underline"
        >
          Download
        </a>
      </div>
    )
  } catch {
    return <p className="text-sm">File attachment</p>
  }
}