import React, { useState } from 'react';

const PostCard = ({ post }) => {
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(post.likes);

    const handleLike = () => {
        if (liked) {
            setLikeCount(prev => prev - 1);
        } else {
            setLikeCount(prev => prev + 1);
        }
        setLiked(!liked);
    };

    return (
        <div className="post-card">
            <div className="post-header">
                <img src={post.userAvatar} alt={post.username} className="user-avatar" />
                <div className="user-info">
                    <h3 className="username">{post.username}</h3>
                    <span className="timestamp">{post.timestamp}</span>
                </div>
            </div>

            <div className="post-content">
                <p className="caption">{post.caption}</p>
                {post.image && (
                    <div className="post-image-container">
                        <img src={post.image} alt="Post content" className="post-image" />
                    </div>
                )}
            </div>

            <div className="post-actions">
                <button
                    className={`action-btn ${liked ? 'liked' : ''}`}
                    onClick={handleLike}
                >
                    <span className="icon">♥</span>
                    <span className="count">{likeCount}</span>
                </button>
                <button className="action-btn">
                    <span className="icon">💬</span>
                    <span className="count">{post.comments}</span>
                </button>
                <button className="action-btn">
                    <span className="icon">↗</span>
                </button>
            </div>

            <style>{`
        .post-card {
          background: var(--color-surface);
          border-radius: var(--radius-lg);
          padding: var(--spacing-lg);
          margin-bottom: var(--spacing-lg);
          box-shadow: var(--shadow-sm);
          border: 1px solid var(--color-border);
        }
        
        .post-header {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-md);
        }
        
        .user-avatar {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-full);
          object-fit: cover;
        }
        
        .username {
          font-size: 1rem;
          font-weight: 600;
          color: var(--color-text-main);
        }
        
        .timestamp {
          font-size: 0.875rem;
          color: var(--color-text-secondary);
        }
        
        .caption {
          margin-bottom: var(--spacing-md);
          color: var(--color-text-main);
          line-height: 1.6;
        }
        
        .post-image-container {
          border-radius: var(--radius-md);
          overflow: hidden;
          margin-bottom: var(--spacing-md);
        }
        
        .post-image {
          width: 100%;
          height: auto;
          display: block;
        }
        
        .post-actions {
          display: flex;
          gap: var(--spacing-lg);
          padding-top: var(--spacing-sm);
          border-top: 1px solid var(--color-background);
        }
        
        .action-btn {
          background: none;
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          color: var(--color-text-secondary);
          font-size: 0.9rem;
          padding: var(--spacing-xs) var(--spacing-sm);
          border-radius: var(--radius-md);
          transition: all 0.2s;
        }
        
        .action-btn:hover {
          background-color: rgba(0,0,0,0.03);
          color: var(--color-text-main);
        }
        
        .action-btn.liked {
          color: #E74C3C;
        }
        
        .action-btn.liked .icon {
          transform: scale(1.1);
        }
      `}</style>
        </div>
    );
};

export default PostCard;
