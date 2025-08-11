
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/database';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, phone: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: (phone?: string) => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, phone, plan, updated_at, subscription_expires_at, subscription_status')
        .eq('id', userId)
        .single();

      if (error) throw error;
      
      const profileData: Profile = {
        id: data.id,
        full_name: data.full_name,
        avatar_url: data.avatar_url,
        phone: data.phone || '',
        plan: (data.plan as 'free' | 'basic' | 'premium') || 'free',
        updated_at: data.updated_at,
        subscription_expires_at: data.subscription_expires_at,
        subscription_status: data.subscription_status
      };
      
      setProfile(profileData);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const cleanPhoneNumber = (phone: string): string => {
    // Remove all non-digit characters and ensure it's in the format "5548991294456"
    const cleaned = phone.replace(/\D/g, '');
    
    // If it starts with +55, remove the +
    if (cleaned.startsWith('55')) {
      return cleaned;
    }
    
    // If it's a Brazilian number without country code, add 55
    if (cleaned.length === 11 || cleaned.length === 10) {
      return '55' + cleaned;
    }
    
    return cleaned;
  };

  const checkExistingPhone = async (phone: string) => {
    try {
      const cleanPhone = cleanPhoneNumber(phone);
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('phone', cleanPhone)
        .limit(1);

      if (error) {
        console.error('Error checking phone:', error);
        return false;
      }

      return data && data.length > 0;
    } catch (error) {
      console.error('Error checking existing phone:', error);
      return false;
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, fullName: string, phone: string) => {
    const cleanPhone = cleanPhoneNumber(phone);
    
    // Verificar se o telefone já está cadastrado
    const phoneExists = await checkExistingPhone(phone);
    if (phoneExists) {
      throw new Error('Este telefone já está cadastrado no sistema.');
    }

    // Log dos dados que estão sendo enviados para debug
    console.log('Dados sendo enviados no signUp:', {
      email,
      fullName,
      phone: cleanPhone
    });

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          full_name: fullName,
          phone: cleanPhone,
        },
      },
    });
    
    if (error) throw error;
    
    // Log adicional para verificar se o usuário foi criado
    console.log('Usuário criado:', data.user);
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const signInWithGoogle = async (phone?: string) => {
    let queryParams = undefined;
    
    if (phone) {
      const cleanPhone = cleanPhoneNumber(phone);
      
      // Verificar se o telefone já está cadastrado
      const phoneExists = await checkExistingPhone(phone);
      if (phoneExists) {
        throw new Error('Este telefone já está cadastrado no sistema.');
      }
      
      queryParams = {
        phone: cleanPhone
      };
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
        queryParams
      },
    });
    if (error) throw error;
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) throw new Error('No user logged in');
    
    // Se está atualizando o telefone, limpe o formato
    if (updates.phone) {
      updates.phone = cleanPhoneNumber(updates.phone);
    }
    
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);
    
    if (error) throw error;
    
    setProfile(prev => prev ? { ...prev, ...updates } : null);
  };

  const value = {
    user,
    session,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
