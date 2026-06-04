import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, increment, setDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import type { Comment } from '../types';
import { containsProfanity, handleProfanityViolation } from '../utils/profanityFilter';

export const useComments = (threadId: string) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'comments'),
      where('threadId', '==', threadId),
      orderBy('createdAt', 'asc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const commentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment));
      setComments(commentsData);
      setLoading(false);
    });
    return unsubscribe;
  }, [threadId]);

  const triggerXpReward = async (action: string) => {
    try {
      if (!auth.currentUser) return;
      const uid = auth.currentUser.uid;
      
      const xpRules: Record<string, number> = { 
        CREATE_THREAD: 50, 
        ADD_COMMENT: 30, 
        RECEIVED_UPVOTE: 5, 
        MARKED_SOLUTION: 20 
      };
      const amount = xpRules[action] || 0;
      
      if (amount > 0) {
        const userRef = doc(db, 'users', uid);
        await setDoc(userRef, { xp: increment(amount) }, { merge: true });
        
        let dropChance = 0;
        if (action === 'CREATE_THREAD') dropChance = 0.50;
        else if (action === 'ADD_COMMENT') dropChance = 0.30;

        if (dropChance > 0 && Math.random() < dropChance) {
          const cardIds = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7'];
          const randomCardId = cardIds[Math.floor(Math.random() * cardIds.length)];
          await addDoc(collection(db, 'user_cards'), {
            userId: uid,
            cardId: randomCardId,
            quantity: 1,
            acquiredAt: Date.now()
          });
        }
      }
    } catch (err) {
      console.error('Failed to trigger XP reward:', err);
    }
  };

  const addComment = async (content: string, authorId: string, authorName: string, parentId: string | null = null) => {
    if (containsProfanity(content)) {
      await handleProfanityViolation();
      throw new Error('Profanity detected. Account banned.');
    }

    await addDoc(collection(db, 'comments'), {
      content,
      authorId,
      authorName,
      threadId,
      parentId,
      upvotes: 0,
      isSolution: false,
      createdAt: serverTimestamp()
    });

    // Increment thread comment count
    const threadRef = doc(db, 'threads', threadId);
    await updateDoc(threadRef, { commentCount: increment(1) });

    // Call Cloudflare API for XP
    await triggerXpReward('ADD_COMMENT');
  };

  const likeComment = async (commentId: string) => {
    const commentRef = doc(db, 'comments', commentId);
    await updateDoc(commentRef, { upvotes: increment(1) });
    await triggerXpReward('RECEIVED_UPVOTE');
  };

  const markAsSolution = async (commentId: string) => {
    const commentRef = doc(db, 'comments', commentId);
    await updateDoc(commentRef, { isSolution: true });
    await triggerXpReward('MARKED_SOLUTION');
  }

  return { comments, loading, addComment, likeComment, markAsSolution };
};
