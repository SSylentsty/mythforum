import React, { useState } from 'react';
import { useThreads } from '../hooks/useThreads';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Heart, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import CategoryNavigation from '../components/CategoryNavigation';
import { CATEGORIES } from '../utils/constants';

const ForumPage: React.FC = () => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const { threads, loading, createThread, likeThread } = useThreads(selectedCategoryId);
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [newThreadCategory, setNewThreadCategory] = useState(CATEGORIES[0].id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      await createThread(title, content, newThreadCategory, user.uid, user.displayName || user.email || 'Anonymous');
      setTitle('');
      setContent('');
      setShowForm(false);
    }
  };

  const getCategoryDetails = (catId: string) => {
    return CATEGORIES.find(c => c.id === catId) || CATEGORIES[0];
  };

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

      <CategoryNavigation 
        selectedCategory={selectedCategoryId} 
        onSelectCategory={setSelectedCategoryId} 
      />

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
              value={newThreadCategory}
              onChange={(e) => setNewThreadCategory(e.target.value)}
              style={{ padding: '0.75rem', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'inherit' }}
            >
              {CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
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

      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading the Scrolls...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {threads.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No tales found in this realm.</p>
          ) : (
            threads.map((thread) => {
              const cat = getCategoryDetails(thread.categoryId);
              return (
                <div key={thread.id} className="mythic-card" style={{ transition: 'transform 0.2s', position: 'relative' }}>
                  {thread.isFeatured && (
                    <div style={{ position: 'absolute', top: '-10px', right: '-10px', background: 'var(--accent)', color: '#000', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                      FEATURED
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {cat.icon} {cat.name}
                      </span>
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
                        style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}
                      >
                        <Heart size={18} />
                        <span>{thread.upvotes || 0}</span>
                      </button>
                      <div style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <MessageSquare size={18} />
                        <span>{thread.commentCount || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default ForumPage;
