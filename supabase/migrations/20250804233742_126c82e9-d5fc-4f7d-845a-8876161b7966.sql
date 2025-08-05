-- Fix CRITICAL security issue: Remove overly permissive profile access policy
-- Currently ALL profiles are publicly viewable, which is a privacy risk

-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;

-- Create a secure policy that only allows users to view their own profile
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Fix database function security: Add proper search_path to functions
-- This prevents SQL injection through search_path manipulation

-- Update handle_new_user function with secure search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = 'public, pg_temp'
AS $function$
BEGIN
    -- Insert profile with proper null handling
    INSERT INTO public.profiles (
        id, 
        full_name, 
        avatar_url
    )
    VALUES (
        NEW.id, 
        NULLIF(NEW.raw_user_meta_data->>'full_name', ''), 
        NULLIF(NEW.raw_user_meta_data->>'avatar_url', '')
    );
    
    RETURN NEW;
END;
$function$;

-- Update reset_daily_ad_counts function with secure search_path
CREATE OR REPLACE FUNCTION public.reset_daily_ad_counts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public, pg_temp'
AS $function$
BEGIN
  -- Reset daily ad counts for all users
  UPDATE user_ad_state 
  SET watched_today = 0,
      updated_at = now()
  WHERE watched_today > 0;
END;
$function$;

-- Update update_updated_at_column function with secure search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public, pg_temp'
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;