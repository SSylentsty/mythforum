import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import { Comment } from '../types';

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

  const triggerXpReward = async (action: string, targetId: string) => {
    try {
      if (!auth.currentUser) return;
      const token = await auth.currentUser.getIdToken();
      await fetch('/api/xp/reward', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action, targetId })
      });
    } catch (err) {
      console.error('Failed to trigger XP reward:', err);
    }
  };

  const addComment = async (content: string, authorId: string, authorName: string, parentId: string | null = null) => {
    const docRef = await addDoc(collection(db, 'comments'), {
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
    await triggerXpReward('ADD_COMMENT', docRef.id);
  };

  const likeComment = async (commentId: string) => {
    const commentRef = doc(db, 'comments', commentId);
    await updateDoc(commentRef, { upvotes: increment(1) });
    await triggerXpReward('RECEIVED_UPVOTE', commentId);
  };

  const markAsSolution = async (commentId: string) => {
    const commentRef = doc(db, 'comments', commentId);
    await updateDoc(commentRef, { isSolution: true });
    await triggerXpReward('MARKED_SOLUTION', commentId);
  }

  return { comments, loading, addComment, likeComment, markAsSolution };
};
