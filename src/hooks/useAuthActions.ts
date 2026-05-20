import { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../firebase/config';

export const useAuthActions = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const signUp = async (email: string, pass: string) => {
    setLoading(true);
    setError(null);
    try {
      await createUserWithEmailAndPassword(auth, email, pass);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, pass: string) => {
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return { signUp, signIn, logout, error, loading };
};
