// Declarações de tipos para Edge Functions do Supabase
declare module "https://deno.land/std@0.190.0/http/server.ts" {
  export function serve(handler: (req: Request) => Response | Promise<Response>): void;
}

declare module 'https://esm.sh/@supabase/supabase-js@2.39.0' {
  export function createClient(url: string, key: string): object;
} 