
import React, { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserWithProfile, Subscription, AuthContextType } from "./types";
import { fetchUserProfile, fetchUserSubscription } from "./utils";

// Create the context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserWithProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const navigate = useNavigate();

  // Initialize auth state
  useEffect(() => {
    // Set up auth state listener FIRST (important to avoid recursive issues)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          // Use setTimeout to prevent potential deadlocks with Supabase client
          setTimeout(() => {
            loadUserData(currentSession.user.id);
          }, 0);
        }
      }
    );
    
    // THEN check for existing session
    const initializeAuth = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        await loadUserData(currentSession.user.id);
      }
      
      setLoading(false);
    };

    initializeAuth();
    
    return () => subscription.unsubscribe();
  }, []);

  // Load user data (profile and subscription)
  const loadUserData = async (userId: string) => {
    try {
      // Fetch user profile
      const updatedUser = await fetchUserProfile(userId, user);
      if (updatedUser) {
        setUser(updatedUser);
      }

      // Check subscription
      const userSubscription = await fetchUserSubscription(userId);
      if (userSubscription) {
        setSubscription(userSubscription);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  // Login with email and password
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        toast.error(error.message);
        return { error };
      }
      
      navigate('/dashboard');
      return {};
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "Failed to login");
      return { error };
    } finally {
      setLoading(false);
    }
  };

  // Login with Google OAuth
  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({ 
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      
      if (error) {
        toast.error(error.message);
        return { error };
      }
      
      return {};
    } catch (error: any) {
      console.error("Google login error:", error);
      toast.error(error.message || "Failed to login with Google");
      return { error };
    } finally {
      setLoading(false);
    }
  };

  // Register new user
  const register = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName
          },
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });
      
      if (error) {
        toast.error(error.message);
        return { error };
      }
      
      toast.success("Registration successful! Please check your email to verify your account.");
      return {};
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(error.message || "Failed to register");
      return { error };
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setSubscription(null);
      navigate('/login');
    } catch (error: any) {
      console.error("Logout error:", error);
      toast.error(error.message || "Failed to logout");
    } finally {
      setLoading(false);
    }
  };

  // Check subscription status
  const checkSubscription = async () => {
    try {
      if (!user) return;
      
      const userSubscription = await fetchUserSubscription(user.id);
      if (userSubscription) {
        setSubscription(userSubscription);
      }
    } catch (error) {
      console.error("Error in checkSubscription:", error);
    }
  };

  const value = {
    user,
    session,
    loading,
    subscription,
    login,
    loginWithGoogle,
    register,
    logout,
    checkSubscription
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
