import { useState, useEffect } from 'react';
import supabase from '@/lib/supabaseClient';

export function useAuth() {
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const checkUserSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Error fetching user session:', error);
        setUserId(null);
      } else {
        setUserId(data.session?.user.id ?? null);
      }
    };

    checkUserSession();
  }, []);

  const setSession = (userId: string | null) => {
    setUserId(userId);
  };

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (userId) {
        const { data, error } = await supabase
        .from('users')
        .select('email')
        .eq('id', userId)
        .single();
        setUserEmail(data?.email);
      }
    };

    fetchUserInfo();
  }, [userId]);


  return { userId, setSession, userEmail };
}