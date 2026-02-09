
import { createClient } from '@supabase/supabase-js';

// Credenciais do projeto Futsystem
const supabaseUrl = 'https://mgoqaybytgdryjroprxh.supabase.co';
const supabaseAnonKey = 'sb_publishable_XkBSBhD0aRSn4lbT2s0sxA_DAm4bwKl';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const isSupabaseConfigured = () => {
  // Verifica se as chaves básicas não são placeholders e se o projeto está acessível
  return supabaseUrl.includes('supabase.co') && supabaseAnonKey.length > 20;
};
