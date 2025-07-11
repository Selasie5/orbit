import { NextRequest } from "next/server";
import { useAuth } from "@/context/authContext";
import { createClient } from "@/utils/supabase/client";


export async function POST(request:NextRequest) {
  //T0DO:Implement matchmaking feature
//   1. Query the db for users 
//   2. Pass the list of users to the AI to implement the matchmaking logic and return the  top matches
//   3. Should return them with very short messages about how they are a perfect match 
//   4. The matches should come in ranking based on the highs match score
// 
 const profilesFromDB = await createClient.


}
