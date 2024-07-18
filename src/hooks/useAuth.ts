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
        setUserEmail(null);
      } else {
        setUserId(data.session?.user.id ?? null);
        setUserEmail(data.session?.user.email ?? null);
      }
    };

    checkUserSession();
  }, []);

  const setSession = (userId: string | null) => {
    setUserId(userId);
  };


  return { userId, setSession, userEmail };
}