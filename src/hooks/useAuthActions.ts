import { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { containsProfanity } from '../utils/profanityFilter';

export const useAuthActions = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const signUp = async (email: string, pass: string, username: string) => {
    setLoading(true);
    setError(null);

    if (containsProfanity(username)) {
      setError('Kullanıcı adınız uygunsuz ifade içeriyor. Lütfen farklı bir isim seçin.');
      setLoading(false);
      return;
    }

    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      if (res.user) {
        await updateProfile(res.user, { displayName: username });
        await setDoc(doc(db, 'users', res.user.uid), {
          username,
          xp: 0,
          level: 1,
          qualityScore: 0,
          dailyXpEarned: 0,
          lastXpReset: Date.now(),
          shadowBanned: false,
          role: 'user',
          bio: 'A new spirit in the Pantheon...',
          createdAt: Date.now()
        });
      }
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
