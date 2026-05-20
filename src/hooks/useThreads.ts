import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, increment, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { XP_REWARDS } from '../utils/xpSystem';

export interface Thread {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  category: string;
  createdAt: any;
  likes: number;
}

export const useThreads = () => {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'threads'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const threadsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Thread));
      setThreads(threadsData);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const createThread = async (title: string, content: string, category: string, authorId: string, authorName: string) => {
    await addDoc(collection(db, 'threads'), {
      title,
      content,
      category,
      authorId,
      authorName,
      createdAt: serverTimestamp(),
      likes: 0
    });

    // Reward XP
    const userRef = doc(db, 'users', authorId);
    await setDoc(userRef, {
      xp: increment(XP_REWARDS.CREATE_THREAD),
      username: authorName // Backfill username if doc is new
    }, { merge: true });
  };

  const likeThread = async (threadId: string) => {
    const threadRef = doc(db, 'threads', threadId);
    await updateDoc(threadRef, {
      likes: increment(1)
    });
  };

  return { threads, loading, createThread, likeThread };
};
