import { supabase } from "@/integrations/supabase/client";
import { UserWithProfile } from "./types";

// Cache simples para dados de perfil
const profileCache = new Map<string, any>();

// Fetch user profile data with RLS recursion handling
export const fetchUserProfile = async (userId: string, currentUser: UserWithProfile | null) => {
  // Verificar cache primeiro
  if (profileCache.has(userId)) {
    return { ...currentUser, profile: profileCache.get(userId) };
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      if (error.code === '42P17') {
        console.error("RLS recursion detected, using fallback profile data");
        const fallbackProfile = { id: userId };
        profileCache.set(userId, fallbackProfile);
        return currentUser ? { ...currentUser, profile: fallbackProfile } : null;
      }
      console.error("Error fetching profile:", error);
      return currentUser;
    }
    
    if (data) {
      // Garante que tenant_id está presente no profile
      const profileWithTenant = { ...data, tenant_id: data.tenant_id };
      profileCache.set(userId, profileWithTenant); // Atualizar cache
      if (currentUser) {
        return { ...currentUser, profile: profileWithTenant };
      }
    }
    
    return currentUser;
  } catch (error) {
    console.error("Error in fetchUserProfile:", error);
    return currentUser;
  }
};

// Check subscription status with error handling
export const fetchUserSubscription = async (userId: string) => {
  try {
    if (!userId) return null;
    
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      if (error.code === '42P17') {
        console.error("RLS recursion in subscriptions, returning null");
        return null;
      }
      console.error("Error checking subscription:", error);
      return null;
    }
    
    if (data && data.length > 0) {
      const latestSubscription = data[0];
      return {
        id: latestSubscription.id,
        status: latestSubscription.status || 'inactive',
        product_id: latestSubscription.stripe_product_id,
        price_id: latestSubscription.stripe_price_id,
        current_period_end: latestSubscription.current_period_end ? new Date(latestSubscription.current_period_end) : undefined
      };
    }
    
    return null;
  } catch (error) {
    console.error("Error in fetchUserSubscription:", error);
    return null;
  }
};
