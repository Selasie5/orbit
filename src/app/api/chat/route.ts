import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(cookies())
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const chatRoomId = url.searchParams.get('chatRoomId')

    if (chatRoomId) {
      // Get messages for a specific chat room
      const { data: messages, error } = await supabase
        .from('messages')
        .select(`
          id,
          chat_room_id,
          sender_id,
          content,
          message_type,
          created_at,
          read_at,
          delivered_at
        `)
        .eq('chat_room_id', chatRoomId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error fetching messages:', error)
        return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
      }

      return NextResponse.json({ messages })
    } else {
      // Get all chat rooms for the user
      const { data: chatRooms, error } = await supabase
        .from('chat_rooms')
        .select(`
          id,
          user1_id,
          user2_id,
          created_at,
          updated_at
        `)
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order('updated_at', { ascending: false })

      if (error) {
        console.error('Error fetching chat rooms:', error)
        return NextResponse.json({ error: 'Failed to fetch chat rooms' }, { status: 500 })
      }

      return NextResponse.json({ chatRooms })
    }
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(cookies())
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, chatRoomId, content, otherUserId } = body

    if (action === 'send_message') {
      // Send a new message
      const { data: message, error } = await supabase
        .from('messages')
        .insert({
          chat_room_id: chatRoomId,
          sender_id: user.id,
          content: content,
          message_type: 'text',
          delivered_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error('Error sending message:', error)
        return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
      }

      // Update the chat room's updated_at timestamp
      await supabase
        .from('chat_rooms')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', chatRoomId)

      return NextResponse.json({ message })
    } else if (action === 'create_chat_room') {
      // Create or get existing chat room
      const { data: existingRoom } = await supabase
        .from('chat_rooms')
        .select('id')
        .or(`and(user1_id.eq.${user.id},user2_id.eq.${otherUserId}),and(user1_id.eq.${otherUserId},user2_id.eq.${user.id})`)
        .single()

      if (existingRoom) {
        return NextResponse.json({ chatRoom: existingRoom })
      }

      // Create new chat room
      const { data: chatRoom, error } = await supabase
        .from('chat_rooms')
        .insert({
          user1_id: user.id,
          user2_id: otherUserId
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating chat room:', error)
        return NextResponse.json({ error: 'Failed to create chat room' }, { status: 500 })
      }

      return NextResponse.json({ chatRoom })
    } else if (action === 'mark_read') {
      // Mark messages as read
      const { error } = await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('chat_room_id', chatRoomId)
        .neq('sender_id', user.id)
        .is('read_at', null)

      if (error) {
        console.error('Error marking messages as read:', error)
        return NextResponse.json({ error: 'Failed to mark messages as read' }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
