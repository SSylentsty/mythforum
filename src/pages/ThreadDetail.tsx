import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { useComments, type Comment } from '../hooks/useComments';
import type { Thread } from '../types';
import { CATEGORIES } from '../utils/constants';
import { Reply, User as UserIcon, CornerDownRight, Heart, CheckCircle } from 'lucide-react';
import RichTextDisplay from '../components/RichTextDisplay';

const CommentItem: React.FC<{ 
  comment: Comment; 
  allComments: Comment[]; 
  onReply: (parentId: string) => void;
  onUpvote: (commentId: string) => void;
  onMarkSolution: (commentId: string) => void;
  threadAuthorId: string;
  currentUserId?: string;
  level?: number;
}> = ({ comment, allComments, onReply, onUpvote, onMarkSolution, threadAuthorId, currentUserId, level = 0 }) => {
  const replies = allComments.filter(c => c.parentId === comment.id);
  const isThreadAuthor = currentUserId === threadAuthorId;

  return (
    <div style={{ marginLeft: level > 0 ? '2rem' : '0', marginTop: '1rem', borderLeft: level > 0 ? '2px solid var(--border-color)' : 'none', paddingLeft: level > 0 ? '1rem' : '0' }}>
      <div className="mythic-card" style={{ padding: '1rem', position: 'relative', border: comment.isSolution ? '1px solid #27ae60' : '1px solid var(--border-color)' }}>
        {comment.isSolution && (
          <div style={{ position: 'absolute', top: '-10px', right: '10px', backgroundColor: '#27ae60', color: 'white', padding: '2px 8px', borderRadius: '10px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle size={12} /> Solution
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.8rem' }}>
          <UserIcon size={14} className="gold-text" />
          <span className="gold-text" style={{ fontWeight: 'bold' }}>{comment.authorName}</span>
          <span style={{ color: 'var(--text-secondary)' }}>• {comment.createdAt?.toDate().toLocaleString()}</span>
        </div>
        
        <RichTextDisplay content={comment.content} />
        
        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem' }}>
          <button 
            onClick={() => onReply(comment.id)}
            style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}
          >
            <Reply size={14} /> Reply
          </button>
          
          <button 
            onClick={() => onUpvote(comment.id)}
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}
          >
            <Heart size={14} /> {comment.upvotes || 0}
          </button>

          {isThreadAuthor && !comment.isSolution && currentUserId !== comment.authorId && (
            <button 
              onClick={() => onMarkSolution(comment.id)}
              style={{ background: 'none', border: 'none', color: '#27ae60', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer', marginLeft: 'auto' }}
            >
              <CheckCircle size={14} /> Mark Solution
            </button>
          )}
        </div>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {replies.map(reply => (
          <CommentItem 
            key={reply.id} 
            comment={reply} 
            allComments={allComments} 
            onReply={onReply} 
            onUpvote={onUpvote}
            onMarkSolution={onMarkSolution}
            threadAuthorId={threadAuthorId}
            currentUserId={currentUserId}
            level={level + 1} 
          />
        ))}
      </div>
    </div>
  );
};

const ThreadDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [thread, setThread] = useState<Thread | null>(null);
  const { user } = useAuth();
  const { comments, loading: commentsLoading, addComment, likeComment, markAsSolution } = useComments(id || '');
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
  const categoryDetails = CATEGORIES.find(c => c.id === thread.categoryId) || CATEGORIES[0];

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
      <Link to="/forum" style={{ color: 'var(--accent)', fontSize: '0.9rem', marginBottom: '1rem', display: 'block' }}>← Return to the Great Hall</Link>
      
      <div className="mythic-card" style={{ marginBottom: '3rem' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {categoryDetails.icon} {categoryDetails.name}
        </span>
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
        <h3>Discussions ({thread.commentCount || comments.length})</h3>
        {user ? (
          <div className="mythic-card" style={{ marginTop: '1rem' }}>
            {replyingTo && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.8rem', color: 'var(--accent)' }}>
                <CornerDownRight size={14} />
                <span>Replying to a scholar's comment</span>
                <button onClick={() => setReplyingTo(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', marginLeft: 'auto', cursor: 'pointer' }}>Cancel</button>
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
              <button type="submit" style={{ padding: '0.5rem 1.5rem', backgroundColor: 'var(--accent)', color: 'var(--bg-primary)', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
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
          <p>Unrolling the scrolls...</p>
        ) : (
          rootComments.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>No responses yet. Be the first to share your wisdom.</p>
          ) : (
            rootComments.map(comment => (
              <CommentItem 
                key={comment.id} 
                comment={comment} 
                allComments={comments} 
                onReply={(commentId) => {
                  setReplyingTo(commentId);
                  window.scrollTo({ top: document.querySelector('form')?.offsetTop ? document.querySelector('form')!.offsetTop - 200 : 0, behavior: 'smooth' });
                }} 
                onUpvote={likeComment}
                onMarkSolution={markAsSolution}
                threadAuthorId={thread.authorId}
                currentUserId={user?.uid}
              />
            ))
          )
        )}
      </div>
    </div>
  );
};

export default ThreadDetail;
