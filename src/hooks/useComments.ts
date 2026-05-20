import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  threadId: string;
  parentId: string | null;
  createdAt: any;
}

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

  const addComment = async (content: string, authorId: string, authorName: string, parentId: string | null = null) => {
    await addDoc(collection(db, 'comments'), {
      content,
      authorId,
      authorName,
      threadId,
      parentId,
      createdAt: serverTimestamp()
    });
  };

  return { comments, loading, addComment };
};
