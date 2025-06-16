import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '../types';
import { Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string, academicLevel: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user.id, session.user.email || '');
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user.id, session.user.email || '');
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string, email: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      // If user profile exists, use it
      if (data) {
        setUser(data);
      } else {
        // If no profile exists, create a default one for existing users
        console.log('No user profile found, creating default profile...');
        const defaultUsername = `user_${email.split('@')[0]}_${userId.substring(0, 8)}`;
        
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert([
            {
              id: userId,
              email: email,
              username: defaultUsername,
              academic_level: 'undergraduate', // Default level
            }
          ])
          .select()
          .single();

        if (insertError) {
          // Check if it's a duplicate key error (23505)
          if (insertError.code === '23505') {
            console.log('User profile already exists, re-fetching...');
            // Profile was created by another process, try to fetch it again
            const { data: existingUser, error: refetchError } = await supabase
              .from('users')
              .select('*')
              .eq('id', userId)
              .single();

            if (refetchError) {
              console.error('Error re-fetching user profile:', refetchError);
              // Create fallback user object
              setUser({
                id: userId,
                email: email,
                username: defaultUsername,
                academic_level: 'undergraduate',
                created_at: new Date().toISOString()
              });
            } else {
              setUser(existingUser);
            }
          } else {
            console.error('Error creating user profile:', insertError);
            // Even if profile creation fails, we can still proceed with basic user info
            setUser({
              id: userId,
              email: email,
              username: defaultUsername,
              academic_level: 'undergraduate',
              created_at: new Date().toISOString()
            });
          }
        } else {
          setUser(newUser);
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Create a fallback user object so the user can still proceed
      const defaultUsername = `user_${email.split('@')[0]}_${userId.substring(0, 8)}`;
      setUser({
        id: userId,
        email: email,
        username: defaultUsername,
        academic_level: 'undergraduate',
        created_at: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, username: string, academicLevel: string) => {
    // First, sign up the user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: username, // Store username in display name as requested
        }
      }
    });

    if (error) throw error;

    if (data.user) {
      try {
        // Wait a moment for the auth session to be established
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Create user profile in our custom users table
        const { error: profileError } = await supabase
          .from('users')
          .insert([
            {
              id: data.user.id,
              email: data.user.email,
              username: username,
              academic_level: academicLevel,
            }
          ]);

        if (profileError) {
          console.error('Error creating profile during signup:', profileError);
          // Don't throw error here, let the user proceed
          // The profile will be created when they sign in
        }
      } catch (profileError) {
        console.error('Error creating profile during signup:', profileError);
        // Don't throw error here, let the user proceed
      }
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};