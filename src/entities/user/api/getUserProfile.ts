import { supabase } from '@/shared/lib/supabaseClient';

export type UserProfile = {
  id: string;
  email: string | null;
  phone: string | null;
  nickname: string | null;
  age_group: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export async function getUserProfile(userId: string): Promise<UserProfile> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    throw new Error(`유저 정보 조회 실패: ${error.message}`);
  }

  return data as UserProfile;
}
