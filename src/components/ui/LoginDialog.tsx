import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Button } from "@/components/ui/button";
import supabase from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';

interface LoginDialogProps {
  open: boolean;
  onClose: () => void;
}

const LoginDialog: React.FC<LoginDialogProps> = ({ open, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState('');
  const { setSession } = useAuth();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      });

      if (error) {
        if (error.message.includes('Email rate limit exceeded')) {
          setMessage('Too many sign-up attempts. Please try again later.');
        } else {
          setMessage(`Error signing up: ${error.message}`);
        }
      } else {
        setMessage('Sign up successful.');
        setSession(data.user?.id ?? null);
        onClose();
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.user) {
        setMessage('Invalid email or password.');
      } else {
        setMessage('Login successful.');
        setSession(data.user.id);
        onClose();
      }
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{isSignUp ? 'Sign Up' : 'Login'}</DialogTitle>
      <DialogContent>
        <form onSubmit={handleAuth}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full p-2 mb-4 border rounded"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full p-2 mb-4 border rounded"
          />
          {isSignUp && (
            <>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First Name"
                className="w-full p-2 mb-4 border rounded"
              />
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last Name"
                className="w-full p-2 mb-4 border rounded"
              />
            </>
          )}
          <Button type="submit">{isSignUp ? 'Sign Up' : 'Login'}</Button>
        </form>
        <Button onClick={() => setIsSignUp(!isSignUp)} className="mt-2">
          {isSignUp ? 'Already have an account? Login' : 'Need an account? Sign Up'}
        </Button>
        {message && <p className="mt-2 text-red-500">{message}</p>}
      </DialogContent>
    </Dialog>
  );
};

export default LoginDialog;