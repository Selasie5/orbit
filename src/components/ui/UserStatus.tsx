'use client'

import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

interface UserStatusProps {
  user: {
    id: string
    full_name: string
    avatar_url?: string
  }
  isOnline?: boolean
  isTyping?: boolean
}

export const UserStatus: React.FC<UserStatusProps> = ({
  user,
  isOnline = false,
  isTyping = false
}) => {
  return (
    <div className="flex items-center space-x-3">
      <div className="relative">
        <Avatar className="h-8 w-8">
          <AvatarImage src={user.avatar_url} />
          <AvatarFallback>
            {user.full_name?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
        {isOnline && (
          <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 border-2 border-white rounded-full" />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{user.full_name}</p>
        {isTyping && (
          <Badge variant="outline" className="text-xs">
            typing...
          </Badge>
        )}
      </div>
    </div>
  )
}