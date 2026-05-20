import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { useComments, type Comment } from '../hooks/useComments';
import type { Thread } from '../hooks/useThreads';
import { Reply, User as UserIcon, CornerDownRight } from 'lucide-react';
import RichTextDisplay from '../components/RichTextDisplay';

const CommentItem: React.FC<{ 
  comment: Comment; 
  allComments: Comment[]; 
  onReply: (parentId: string) => void;
  level?: number;
}> = ({ comment, allComments, onReply, level = 0 }) => {
  const replies = allComments.filter(c => c.parentId === comment.id);

  return (
    <div style={{ marginLeft: level > 0 ? '2rem' : '0', marginTop: '1rem' }}>
      <div className="mythic-card" style={{ padding: '1rem', borderLeft: level > 0 ? '2px solid var(--accent)' : '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.8rem' }}>
          <UserIcon size={14} className="gold-text" />
          <span className="gold-text" style={{ fontWeight: 'bold' }}>{comment.authorName}</span>
          <span style={{ color: 'var(--text-secondary)' }}>• {comment.createdAt?.toDate().toLocaleString()}</span>
        </div>
        <RichTextDisplay content={comment.content} />
        <button 
          onClick={() => onReply(comment.id)}
          style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.5rem' }}
        >
          <Reply size={14} />
          Reply
        </button>
      </div>
      {replies.map(reply => (
        <CommentItem key={reply.id} comment={reply} allComments={allComments} onReply={onReply} level={level + 1} />
      ))}
    </div>
  );
};

const ThreadDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [thread, setThread] = useState<Thread | null>(null);
  const { user } = useAuth();
  const { comments, loading: commentsLoading, addComment } = useComments(id || '');
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  useEffect(() => {
    const fetchThread = async () => {
      if (id) {
        const docRef = doc(db, 'threads', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setThread({ id: docSnap.id, ...docSnap.data() } as Thread);
        }
      }
    };
    fetchThread();
  }, [id]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user && newComment.trim()) {
      await addComment(newComment, user.uid, user.displayName || user.email || 'Anonymous', replyingTo);
      setNewComment('');
      setReplyingTo(null);
    }
  };

  if (!thread) return <div style={{ padding: '2rem', textAlign: 'center' }}>Consulting the Oracles...</div>;

  const rootComments = comments.filter(c => !c.parentId);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
      <Link to="/forum" style={{ color: 'var(--accent)', fontSize: '0.9rem', marginBottom: '1rem', display: 'block' }}>← Return to the Great Hall</Link>
      
      <div className="mythic-card" style={{ marginBottom: '3rem' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{thread.category} Mythology</span>
        <h1 style={{ margin: '0.5rem 0', fontSize: '2.5rem' }}>{thread.title}</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          <UserIcon size={16} />
          <span>Shared by <span className="gold-text">{thread.authorName}</span></span>
          <span>•</span>
          <span>{thread.createdAt?.toDate().toLocaleDateString()}</span>
        </div>
        <div style={{ fontSize: '1.1rem', lineHeight: '1.8', fontFamily: 'var(--serif-font)' }}>
          <RichTextDisplay content={thread.content} />
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h3>Discussions ({comments.length})</h3>
        {user ? (
          <div className="mythic-card" style={{ marginTop: '1rem' }}>
            {replyingTo && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.8rem', color: 'var(--accent)' }}>
                <CornerDownRight size={14} />
                <span>Replying to a scholar's comment</span>
                <button onClick={() => setReplyingTo(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', marginLeft: 'auto' }}>Cancel</button>
              </div>
            )}
            <form onSubmit={handleSubmitComment}>
              <textarea 
                placeholder="Offer your insights..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                required
                rows={3}
                style={{ width: '100%', padding: '0.75rem', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'inherit', fontFamily: 'var(--body-font)', marginBottom: '1rem' }}
              />
              <button type="submit" style={{ padding: '0.5rem 1.5rem', backgroundColor: 'var(--accent)', color: 'var(--bg-primary)', border: 'none', fontWeight: 'bold' }}>
                Post Insight
              </button>
            </form>
          </div>
        ) : (
          <p style={{ marginTop: '1rem', fontStyle: 'italic' }}>You must <Link to="/login" className="gold-text">Sign In</Link> to participate in the discussion.</p>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {commentsLoading ? (
          <p>Unrolling the comments...</p>
        ) : (
          rootComments.map(comment => (
            <CommentItem 
              key={comment.id} 
              comment={comment} 
              allComments={comments} 
              onReply={(id) => {
                setReplyingTo(id);
                window.scrollTo({ top: document.querySelector('form')?.offsetTop ? document.querySelector('form')!.offsetTop - 200 : 0, behavior: 'smooth' });
              }} 
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ThreadDetail;
