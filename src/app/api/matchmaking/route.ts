import { NextRequest } from "next/server";
import { useAuth } from "@/context/authContext";
import { createClient } from "@/utils/supabase/client";


export async function GET(request:NextRequest) {
  //T0DO:Implement matchmaking feature
//   1. Query the db for users 
//   2. Pass the list of users to the AI to implement the matchmaking logic and return the  top matches
//   3. Should return them with very short messages about how they are a perfect match 
//   4. The matches should come in ranking based on the highs match score
// 

const supabase = createClient();
 const profilesFromDB = await supabase
 .from('profiles')
 .select('id,email,full_name,avatar_url,course,skills,bio,interests')
 if(profilesFromDB.error){
return new Response(JSON.stringify({ error: profilesFromDB.error.message }), {
  status: 500,
});
 }
 return new Response(JSON.stringify({ profiles: profilesFromDB.data }), {
  status: 200})
}
