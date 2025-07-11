import { NextRequest } from "next/server";
import { createServiceRoleClient } from "@/utils/supabase/service";

export async function GET(request: NextRequest) {
  try {
    console.log('=== MATCHMAKING DEBUG API ===');
    
    // Test service role client
    const serviceClient = createServiceRoleClient();
    console.log('Service client created successfully');
    
    // Test profiles query
    const { data: allProfiles, error } = await serviceClient
      .from('profiles')
      .select('*');
    
    if (error) {
      console.error('Database error:', error);
      return new Response(JSON.stringify({ 
        error: 'Database error',
        details: error 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    console.log('Total profiles in database:', allProfiles?.length || 0);
    console.log('Sample profile:', allProfiles?.[0]);
    
    // Test environment variables
    const alleAiKey = process.env.NEXT_PUBLIC_ALLEAI_API_KEY;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    return new Response(JSON.stringify({ 
      success: true,
      totalProfiles: allProfiles?.length || 0,
      sampleProfile: allProfiles?.[0] || null,
      hasAlleAiKey: !!alleAiKey,
      hasServiceKey: !!supabaseServiceKey,
      alleAiKeyPreview: alleAiKey ? `${alleAiKey.substring(0, 10)}...` : 'Not set',
      serviceKeyPreview: supabaseServiceKey ? `${supabaseServiceKey.substring(0, 10)}...` : 'Not set',
      profiles: allProfiles || []
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Debug API error:', error);
    return new Response(JSON.stringify({ 
      error: 'Debug API error',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
