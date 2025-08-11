
-- Ensure the phone column in profiles table stores only numbers
-- Convert existing data to the new format and update column type if needed
UPDATE profiles 
SET phone = regexp_replace(phone, '[^0-9]', '', 'g') 
WHERE phone IS NOT NULL AND phone != '';

-- Ensure the column type is appropriate for storing phone numbers as text
ALTER TABLE profiles ALTER COLUMN phone TYPE text;

-- Add a check constraint to ensure phone numbers only contain digits
ALTER TABLE profiles 
ADD CONSTRAINT phone_format_check 
CHECK (phone IS NULL OR phone ~ '^[0-9]+$');
