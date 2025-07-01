import { User, Session } from "@supabase/supabase-js";

// Define the user type with profile
export interface UserWithProfile extends User {
  profile?: {
    first_name?: string;
    last_name?: string;
    role?: string;
    cpf?: string;
    telefone?: string;
    data_nascimento?: string;
    tenant_id?: string;
  }
}

// Define the subscription type
export interface Subscription {
  id: string;
  status: string;
  product_id?: string;
  price_id?: string;
  current_period_end?: Date;
}

// Define the auth context type
export interface AuthContextType {
  user: UserWithProfile | null;
  session: Session | null;
  loading: boolean;
  subscription: Subscription | null;
  login: (email: string, password: string) => Promise<{ error?: unknown }>;
  loginWithGoogle: () => Promise<{ error?: unknown }>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<{ error?: unknown }>;
  logout: () => Promise<void>;
  checkSubscription: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ error?: unknown }>;
  resetPassword: (password: string) => Promise<{ error?: unknown }>;
}
