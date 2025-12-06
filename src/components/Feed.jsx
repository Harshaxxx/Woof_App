import React, { useEffect, useState } from 'react';
import Card from './Card';
import Button from './Button';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { Plus, X } from 'lucide-react';

const Feed = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [newPostText, setNewPostText] = useState('');
  const [posting, setPosting] = useState(false);

  const buddies = [
    { id: 1, name: "Luna", distance: "0.2mi", color: "#FF6B35" },
    { id: 2, name: "Max", distance: "0.5mi", color: "#004E64" },
    { id: 3, name: "Cooper", distance: "0.8mi", color: "#FFD93D" },
    { id: 4, name: "Bella", distance: "1.2mi", color: "#E74C3C" },
  ];

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('feed_posts')
        .select(`
          *,
          profiles:user_id (
            display_name,
            dog_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      if (data) {
        setPosts(data);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPostText.trim()) return;

    try {
      setPosting(true);
      const { data, error } = await supabase
        .from('feed_posts')
        .insert({
          user_id: user.id,
          text: newPostText,
          type: 'manual'
        })
        .select(`
          *,
          profiles:user_id (
            display_name,
            dog_name,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;

      // Optimistic update
      setPosts([data, ...posts]);
      setNewPostText('');
      setShowNewPostModal(false);

    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
    } finally {
      setPosting(false);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <div className="container" style={{ paddingBottom: '80px' }}>
      {/* Header */}
      <div className="flex items-center" style={{ marginBottom: '20px', position: 'relative', justifyContent: 'flex-end', height: '40px' }}>
        <div style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <img src="/logo.png" alt="Woof" style={{ width: '36px', height: '36px', borderRadius: '8px' }} />
          <h1 style={{ color: 'var(--color-primary)', margin: 0, fontSize: '2rem' }}>woof</h1>
        </div>
        <Button variant="ghost" onClick={() => navigate('/notifications')} style={{ padding: '8px' }}>🔔</Button>
      </div>

      {/* Nearby Buddies */}
      <div style={{ marginBottom: '25px', paddingTop: '20px', position: 'relative', zIndex: 5 }}>
        <div className="flex justify-between items-center" style={{ marginBottom: '10px' }}>
          <h3>Nearby Buddies</h3>
          <a href="#" className="text-sm" style={{ color: 'var(--color-primary)' }}>See all</a>
        </div>

        <div style={{
          display: 'flex',
          gap: '15px',
          overflowX: 'auto',
          paddingBottom: '10px',
          scrollbarWidth: 'none'
        }}>
          {buddies.map(buddy => (
            <div key={buddy.id} className="text-center" style={{ minWidth: '70px' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: buddy.color,
                margin: '0 auto 5px',
                border: '2px solid var(--color-bg)',
                boxShadow: '0 0 0 2px var(--color-primary)'
              }} />
              <p className="text-sm font-bold">{buddy.name}</p>
              <p className="text-sm text-muted" style={{ fontSize: '0.7rem' }}>{buddy.distance}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Feed */}
      <div className="flex-col gap-md">
        {loading ? (
          <div className="text-center text-muted">Loading feed...</div>
        ) : posts.length === 0 ? (
          <div className="text-center text-muted" style={{ padding: '40px 0' }}>
            <p>No posts yet. Be the first to share a walk! 🐕</p>
          </div>
        ) : (
          posts.map(post => (
            <Card key={post.id} style={{ padding: 0 }}>
              <div style={{ padding: 'var(--spacing-md)' }}>
                <div className="flex items-center gap-sm" style={{ marginBottom: '10px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'var(--color-primary)', // Default avatar color
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    color: '#000'
                  }}>
                    {post.profiles?.dog_name?.[0] || '?'}
                  </div>
                  <div>
                    <p className="font-bold">{post.profiles?.dog_name || 'Unknown Dog'}</p>
                    <p className="text-sm text-muted">{formatTime(post.created_at)}</p>
                  </div>
                </div>
                <p>{post.text}</p>
              </div>

              {/* Image Area - Only show if image_url exists or it's a walk summary (placeholder for now) */}
              {(post.image_url || post.type === 'walk_summary') && (
                <div style={{
                  height: '200px',
                  background: 'var(--color-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-text-muted)',
                  overflow: 'hidden'
                }}>
                  {post.type === 'walk_summary' ? (
                    <div style={{ textAlign: 'center' }}>
                      <span style={{ fontSize: '3rem' }}>🗺️</span>
                      <p>Walk Map</p>
                    </div>
                  ) : (
                    <img src={post.image_url} alt="Post content" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}
                </div>
              )}

              <div style={{
                padding: '10px var(--spacing-md)',
                borderTop: '1px solid var(--color-border)',
                display: 'flex',
                gap: '20px'
              }}>
                <span className="text-sm">❤️ 0</span>
                <span className="text-sm">💬 0</span>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Floating Action Button for New Post */}
      <div style={{
        position: 'fixed',
        bottom: '90px',
        right: '20px',
        zIndex: 100
      }}>
        <button
          onClick={() => setShowNewPostModal(true)}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'var(--color-primary)',
            color: '#000',
            border: 'none',
            boxShadow: '0 4px 12px rgba(255, 184, 0, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <Plus size={32} />
        </button>
      </div>

      {/* New Post Modal */}
      {showNewPostModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <Card className="animate-fade-in" style={{ width: '100%', maxWidth: '500px' }}>
            <div className="flex justify-between items-center" style={{ marginBottom: '15px' }}>
              <h3>New Post</h3>
              <button
                onClick={() => setShowNewPostModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}
              >
                <X size={24} />
              </button>
            </div>

            <textarea
              value={newPostText}
              onChange={(e) => setNewPostText(e.target.value)}
              placeholder="What are you and your pup up to?"
              style={{
                width: '100%',
                height: '120px',
                background: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                padding: '15px',
                color: 'var(--color-text-main)',
                marginBottom: '20px',
                resize: 'none',
                fontFamily: 'inherit'
              }}
            />

            <Button fullWidth onClick={handleCreatePost} disabled={posting}>
              {posting ? 'Posting...' : 'Post'}
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Feed;
