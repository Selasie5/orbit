# Fix Null Data Issue - Database Setup

The issue you're experiencing is likely because the `profiles` table doesn't exist or the Row Level Security (RLS) policies are preventing data insertion.

## Quick Fix Steps:

### 1. Check if Profiles Table Exists
Go to your Supabase Dashboard → Table Editor and check if the `profiles` table exists.

### 2. Create the Profiles Table (if missing)
Copy and paste this SQL into your Supabase SQL Editor:

```sql
-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  course TEXT,
  skills TEXT,
  interests TEXT,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for users to manage their own profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
```

### 3. Test the Setup
After running the SQL above:
1. Try signing up a new user
2. Check the browser console for any error messages
3. Go to Supabase → Table Editor → profiles to see if data was inserted

### 4. Alternative: Disable RLS Temporarily (for testing only)
If you're still having issues, you can temporarily disable RLS:

```sql
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
```

**Note:** Only do this for testing. Re-enable it after confirming the table works:

```sql
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
```

## What the Code Changes Do:

1. **Better Error Logging**: The updated signup code now shows detailed error messages in the console
2. **Fallback to Auth Metadata**: If profile table insertion fails, data is saved to the user's auth metadata
3. **Data Verification**: Added `.select()` to confirm the profile was created
4. **Comprehensive Updates**: Both profile table and auth metadata are updated for consistency

## Check Your Console

After making these changes, try signing up again and check the browser console (F12) for detailed error messages. This will help identify exactly what's failing.

## Common Issues and Solutions:

- **Table doesn't exist**: Run the SQL above to create it
- **RLS blocking inserts**: Check the policies or temporarily disable RLS
- **User not authenticated**: Make sure the user signup is successful before profile creation
- **Missing columns**: Ensure all columns in the SQL match your form fields
