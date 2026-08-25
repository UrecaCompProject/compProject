import { supabase } from '@/lib/supabaseClient';

export default async function postLogout() {
  const { error } = await supabase.auth.signOut();

  if (error) throw new Error(error.message);
}
