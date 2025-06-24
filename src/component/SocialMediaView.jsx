import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
const SocialMediaView = ({ disasterId, token }) => {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const effectiveId = disasterId || 'default'; 
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE}/disasters/${effectiveId}/social-media`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setPosts(res.data.posts || []);
        setError('');
      } catch (err) {
        console.error(err);
        setError('Failed to load social media posts.');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [effectiveId, token]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">📢 Social Media Updates</h2>
      {loading && <p>Loading posts...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && posts.length === 0 && <p>No posts found.</p>}
      <ul className="space-y-2 mt-2">
        {posts.map((post, idx) => (
          <li key={idx} className="border-b pb-2">
            <strong>@{post.user}</strong>: {post.post}
            <br />
            <span className="text-sm text-gray-500">{new Date(post.timestamp).toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SocialMediaView;
