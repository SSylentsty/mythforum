import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: any;
}

export const useBlogs = (uid?: string) => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }
    const q = query(
      collection(db, 'blogs'),
      where('authorId', '==', uid),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const blogsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost));
      setBlogs(blogsData);
      setLoading(false);
    });
    return unsubscribe;
  }, [uid]);

  const createBlog = async (title: string, content: string, authorId: string, authorName: string) => {
    await addDoc(collection(db, 'blogs'), {
      title,
      content,
      authorId,
      authorName,
      createdAt: serverTimestamp()
    });
  };

  return { blogs, loading, createBlog };
};
