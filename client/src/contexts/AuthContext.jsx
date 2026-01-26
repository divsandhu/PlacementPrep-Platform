import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    const init = async () => {
      try {
        console.log("AuthContext init - getting session");

        const { data, error } = await supabase.auth.getSession();
        if (error) console.error("getSession error:", error);

        const session = data?.session;
        console.log("Initial session:", session);

        if (!isMounted.current) return;

        setUser(session?.user ?? null);

        // ✅ Always stop loading here
        setLoading(false);

        // ✅ Fetch profile separately (doesn't block UI)
        if (session?.user) {
          fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
      } catch (err) {
        console.error("Auth init failed:", err);
        if (isMounted.current) {
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      }
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted.current) return;

      setUser(session?.user ?? null);
      setLoading(false); // ✅ Never keep app blocked

      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => {
      isMounted.current = false;
      listener?.subscription?.unsubscribe();
    };
  }, []);

  // Cleanup effect
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;
      if (isMounted.current) setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
      if (isMounted.current) setProfile(null);
    }
  };

  const signUp = async (email, password, username) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
          },
        },
      });

      if (error) throw error;

      // Profile will be created by trigger automatically
      // Wait for trigger to complete, then update username if it's different
      if (data.user) {
        // Wait for trigger to create profile
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Check if profile exists and update username if needed
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', data.user.id)
          .single();

        // Only update if username is different (trigger might have used email prefix)
        if (existingProfile && existingProfile.username !== username) {
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ username: username })
            .eq('id', data.user.id);

          if (updateError) {
            console.error('Profile update error:', updateError);
            // Don't throw - user is still created, just username might be wrong
          }
        } else if (!existingProfile) {
          // Profile wasn't created by trigger, create it manually
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              username: username,
            });

          if (insertError) {
            console.error('Profile creation error:', insertError);
            // Don't throw - user is still created
          }
        }
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const signIn = async (email, password) => {
    try {
      // Check if Supabase is configured
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        return {
          data: null,
          error: {
            message: 'Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file. See SETUP.md for instructions.'
          }
        };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        throw error;
      }
      return { data, error: null };
    } catch (error) {
      console.error('Sign in failed:', error);
      // Provide more helpful error messages
      if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
        return {
          data: null,
          error: {
            message: 'Unable to connect to Supabase. Please check:\n1. Your Supabase URL is correct\n2. Your internet connection\n3. Supabase service is running\n\nSee SETUP.md for configuration help.'
          }
        };
      }
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      console.log('Attempting to sign out...');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Supabase signout error:', error);
        throw error;
      }
      console.log('Signout successful, clearing state...');
      if (isMounted.current) {
        setUser(null);
        setProfile(null);
        navigate('/');
      }
      return { error: null };
    } catch (error) {
      console.error('AuthContext signout error:', error);
      return { error };
    }
  };

  const resetPassword = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?view=reset`,
      });
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const updateProfile = async (updates) => {
    try {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      setProfile(data);
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
    isAdmin: profile?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
