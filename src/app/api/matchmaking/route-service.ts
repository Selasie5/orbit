import { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createServiceRoleClient } from "@/utils/supabase/service";
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    
    const supabase = createClient(cookies())

    // Get the current user to verify authentication
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('User authenticated:', user.id);

    // Use service role client to bypass RLS and read all profiles
    const serviceClient = createServiceRoleClient();
    
    console.log('Fetching profiles from database with service role...');
    
    const { data: profilesFromDB, error } = await serviceClient
      .from('profiles')
      .select('*')
      .neq('id', user.id) 
    
    if (error) {
      console.error('Database error:', error);
      return new Response(JSON.stringify({ 
        error: error.message,
        details: error.details 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    console.log('Profiles fetched:', profilesFromDB?.length || 0);
    console.log('Profile data sample:', profilesFromDB?.[0]);
    
    return new Response(JSON.stringify({ 
      profiles: profilesFromDB || [],
      count: profilesFromDB?.length || 0,
      currentUser: user.id,
      message: 'Using service role client to bypass RLS'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('API error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
