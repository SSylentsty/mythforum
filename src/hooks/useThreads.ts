import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, increment, where } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import type { Thread } from '../types';
import { containsProfanity, handleProfanityViolation } from '../utils/profanityFilter';

export const useThreads = (categoryId: string | null = null) => {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let q = query(collection(db, 'threads'), orderBy('createdAt', 'desc'));
    
    if (categoryId) {
      q = query(collection(db, 'threads'), where('categoryId', '==', categoryId), orderBy('createdAt', 'desc'));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const threadsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Thread));
      setThreads(threadsData);
      setLoading(false);
    });
    return unsubscribe;
  }, [categoryId]);

  const triggerXpReward = async (action: string) => {
    try {
      if (!auth.currentUser) return;
      const xpRules = { CREATE_THREAD: 10, ADD_COMMENT: 2, RECEIVED_UPVOTE: 5, MARKED_SOLUTION: 20 };
      const amount = xpRules[action as keyof typeof xpRules] || 0;
      if (amount > 0) {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userRef, {
          xp: increment(amount)
        });
      }
    } catch (err) {
      console.error('Failed to trigger XP reward:', err);
    }
  };

  const createThread = async (title: string, content: string, categoryId: string, authorId: string, authorName: string) => {
    if (containsProfanity(title + ' ' + content)) {
      await handleProfanityViolation();
      throw new Error('Profanity detected. Account banned.');
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    await addDoc(collection(db, 'threads'), {
      title,
      slug,
      content,
      categoryId,
      authorId,
      authorName,
      tags: [],
      upvotes: 0,
      isFeatured: false,
      commentCount: 0,
      createdAt: serverTimestamp()
    });

    // Call Cloudflare API for XP instead of client-side Firestore update
    await triggerXpReward('CREATE_THREAD');
  };

  const likeThread = async (threadId: string) => {
    // Note: In real app, you should check if user already liked
    const threadRef = doc(db, 'threads', threadId);
    await updateDoc(threadRef, {
      upvotes: increment(1)
    });
    await triggerXpReward('RECEIVED_UPVOTE');
  };

  return { threads, loading, createThread, likeThread };
};
