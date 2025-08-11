
-- Update the handle_new_user function to properly handle phone from user metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public, pg_temp'
AS $function$
BEGIN
    -- Insert profile with proper null handling including phone
    INSERT INTO public.profiles (
        id, 
        full_name, 
        avatar_url,
        phone
    )
    VALUES (
        NEW.id, 
        NULLIF(NEW.raw_user_meta_data->>'full_name', ''), 
        NULLIF(NEW.raw_user_meta_data->>'avatar_url', ''),
        NULLIF(NEW.raw_user_meta_data->>'phone', '')
    );
    
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Log the error but don't block user creation
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$function$
