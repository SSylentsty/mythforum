import React, { useState } from 'react';
import { useThreads } from '../hooks/useThreads';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Heart, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const ForumPage: React.FC = () => {
  const { threads, loading, createThread, likeThread } = useThreads();
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Greek');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      await createThread(title, content, category, user.uid, user.displayName || user.email || 'Anonymous');
      setTitle('');
      setContent('');
      setShowForm(false);
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading the Scrolls...</div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem' }}>The Great Hall</h1>
        {user && (
          <button 
            onClick={() => setShowForm(!showForm)}
            className="mythic-card"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}
          >
            <PlusCircle size={20} />
            Start an Epic Tale
          </button>
        )}
      </div>

      {showForm && (
        <div className="mythic-card" style={{ marginBottom: '2rem' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input 
              type="text" 
              placeholder="Title of your tale..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{ padding: '0.75rem', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'inherit', fontFamily: 'var(--header-font)' }}
            />
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{ padding: '0.75rem', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'inherit' }}
            >
              <option value="Greek">Greek Mythology</option>
              <option value="Norse">Norse Gods</option>
              <option value="Egyptian">Egyptian Mysteries</option>
              <option value="Asian">Asian Lore</option>
              <option value="General">General Mythos</option>
            </select>
            <textarea 
              placeholder="Share your wisdom..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={5}
              style={{ padding: '0.75rem', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'inherit', fontFamily: 'var(--body-font)' }}
            />
            <button type="submit" style={{ padding: '0.75rem', backgroundColor: 'var(--accent)', color: 'var(--bg-primary)', border: 'none', fontWeight: 'bold' }}>
              Publish to the Scrolls
            </button>
          </form>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {threads.map((thread) => (
          <div key={thread.id} className="mythic-card" style={{ transition: 'transform 0.2s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{thread.category}</span>
                <Link to={`/thread/${thread.id}`}>
                  <h3 style={{ margin: '0.5rem 0', color: 'var(--text-primary)' }}>{thread.title}</h3>
                </Link>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  By <span className="gold-text">{thread.authorName}</span> • {thread.createdAt?.toDate().toLocaleDateString()}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <button 
                  onClick={() => likeThread(thread.id)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                >
                  <Heart size={18} />
                  <span>{thread.likes}</span>
                </button>
                <div style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <MessageSquare size={18} />
                  <span>View</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ForumPage;
