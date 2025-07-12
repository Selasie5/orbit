// Test script to create some chat rooms in the database
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://pztowiqkuvngzpauhlho.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6dG93aXFrdXZuZ3pwYXVobGhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjE0MzA4NSwiZXhwIjoyMDY3NzE5MDg1fQ.d2soO-SCyvnTjrevoC05ncvGSnjbZt_MaocbDgV3b_4'

const supabase = createClient(supabaseUrl, supabaseKey)

async function createTestChats() {
  try {
    console.log('Checking available tables...')
    
    // Check auth.users instead of public.users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      console.error('Error fetching auth users:', authError)
      
      // Alternative: Let's check what tables exist
      console.log('Checking chat_rooms table structure...')
      const { data: chatRooms, error: crError } = await supabase
        .from('chat_rooms')
        .select('*')
        .limit(1)
        
      if (crError) {
        console.error('chat_rooms error:', crError)
      } else {
        console.log('chat_rooms structure:', chatRooms)
      }
      
      return
    }
    
    console.log('Auth users found:', authUsers.users.length)
    console.log('Users:', authUsers.users.map(u => ({ id: u.id, email: u.email })))
    
    if (authUsers.users && authUsers.users.length >= 2) {
      console.log('Creating chat rooms with existing auth users...')
      
      // Create chat rooms between existing users
      const testChatRooms = [
        {
          user1_id: authUsers.users[0].id,
          user2_id: authUsers.users[1].id
        }
      ]
      
      // Add more if we have more users
      if (authUsers.users.length > 2) {
        testChatRooms.push({
          user1_id: authUsers.users[0].id,
          user2_id: authUsers.users[2].id
        })
      }
      
      const { data, error } = await supabase
        .from('chat_rooms')
        .insert(testChatRooms)
        .select()
      
      if (error) {
        console.error('Error creating chat rooms:', error)
      } else {
        console.log('Created chat rooms:', data)
        
        // Add some test messages
        if (data && data.length > 0) {
          const testMessages = [
            {
              chat_room_id: data[0].id,
              sender_id: authUsers.users[0].id,
              content: 'Hey! How are you doing?',
              message_type: 'text'
            },
            {
              chat_room_id: data[0].id,
              sender_id: authUsers.users[1].id, 
              content: 'I\'m doing great! Thanks for asking 😊',
              message_type: 'text'
            }
          ]
          
          const { data: messages, error: msgError } = await supabase
            .from('messages')
            .insert(testMessages)
            .select()
            
          if (msgError) {
            console.error('Error creating messages:', msgError)
          } else {
            console.log('Created messages:', messages)
          }
        }
      }
    } else {
      console.log('Not enough auth users found. Please create some users first.')
    }
    
  } catch (error) {
    console.error('Error:', error)
  }
}

createTestChats()
