
-- Adicionar campo phone na tabela profiles
ALTER TABLE public.profiles ADD COLUMN phone TEXT;

-- Tornar o campo phone obrigatório
ALTER TABLE public.profiles ALTER COLUMN phone SET NOT NULL;

-- Atualizar a função handle_new_user para incluir o telefone
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public, pg_temp'
AS $function$
BEGIN
    -- Insert profile with proper null handling, including phone
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
END;
$function$
