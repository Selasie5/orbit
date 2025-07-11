# Fixing Matchmaking API Empty Results

## The Problem
The matchmaking API returns an empty array despite having profiles in the database because of Row Level Security (RLS) policies on the `profiles` table.

## Current RLS Policy Issue
The profiles table has this restrictive policy:
```sql
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
```

This only allows users to see their own profile, but matchmaking needs to see all other users' profiles.

## Solution 1: Update RLS Policies (Recommended for Production)

Run this SQL in your Supabase SQL Editor:

```sql
-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;

-- Create a policy that allows authenticated users to view all profiles
CREATE POLICY "Authenticated users can view all profiles" ON profiles
  FOR SELECT USING (auth.role() = 'authenticated');
```

**Pros:**
- Proper security model
- Still requires authentication
- Clean approach

**Cons:**
- Requires database schema changes
- All authenticated users can see all profiles

## Solution 2: Use Service Role Key (Quick Fix)

1. **Add Environment Variable**
   Add this to your `.env.local` file:
   ```
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```
   
   Get the service role key from your Supabase dashboard > Settings > API.

2. **The API Already Uses Service Role**
   The code in `/api/matchmaking/route.ts` now uses the service role client which bypasses RLS entirely.

**Pros:**
- No database changes needed
- Works immediately
- Full admin access when needed

**Cons:**
- Service role key has full database access (be careful)
- Bypasses all security policies

## Files Modified

- `src/utils/supabase/service.ts` - Service role client
- `src/app/api/matchmaking/route.ts` - Updated to use service role
- `database/add-matchmaking-policy.sql` - SQL script for RLS fix

## Testing

After implementing either solution:

1. Make sure you're logged in
2. Navigate to the home page
3. Check the browser console for API logs
4. The API should now return the profiles

## Next Steps

1. **For Development**: Use Solution 2 (service role) to get unblocked quickly
2. **For Production**: Implement Solution 1 (proper RLS policies) for better security
3. Consider implementing more granular policies if needed (e.g., users can only see profiles of users in the same course)

## Security Considerations

- The service role key should be kept secret and only used server-side
- Consider implementing rate limiting on the matchmaking API
- Consider adding additional filters (e.g., by course, preferences) to limit what profiles are returned
