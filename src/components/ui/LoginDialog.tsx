import React, { useState } from 'react';
import { Dialog, DialogContent } from '@mui/material';
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
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth 
      maxWidth="md" 
      PaperProps={{ style: { borderRadius: 16 }}}
    >
    <DialogContent>
      <div className="flex flex-col w-full overflow-scroll">
        <div className="flex flex-col items-center justify-center gap-1 p-12 text-center">
          <div className="font-extrabold text-3xl text-slate-800">
            {isSignUp ? 'Join Commonwealth.ai' : 'Login to Commonwealth.ai'}
          </div>
          <div className="text-slate-500 font-medium">
          {isSignUp ? 'We are excited to have you!' : 'Welcome Back!'}
          </div>
        </div>
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
          {message && <div className="text-red-500 font-medium">{message}</div>}
          <Button type="submit" className="w-full bg-purple-900">{isSignUp ? 'Sign Up' : 'Login'}</Button>
        </form>
        <Button onClick={() => setIsSignUp(!isSignUp)} className="w-full mt-2">{isSignUp ? 'Already have an account? Login' : 'Need an account? Sign Up'}</Button>
      </div>
    </DialogContent>
    </Dialog>
  );
};

export default LoginDialog;