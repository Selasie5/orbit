-- Add policy to allow authenticated users to view all profiles for matchmaking
-- Run this in your Supabase SQL Editor (PostgreSQL)

-- First, drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;

-- Create a single policy that allows authenticated users to view all profiles
-- This enables both viewing your own profile AND viewing others for matchmaking
CREATE POLICY "Authenticated users can view all profiles" ON profiles
  FOR SELECT USING (auth.role() = 'authenticated');

-- Alternative: If you want separate policies, use these instead:
-- CREATE POLICY "Users can view their own profile" ON profiles
--   FOR SELECT USING (auth.uid() = id);
-- 
-- CREATE POLICY "Users can view other profiles for matchmaking" ON profiles
--   FOR SELECT USING (auth.role() = 'authenticated' AND auth.uid() != id);

-- Note: This policy allows any authenticated user to read all profiles,
-- which is necessary for the matchmaking feature to work.
