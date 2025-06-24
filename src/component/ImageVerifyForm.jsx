import React, { useState } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
const ImageVerifyForm = ({ disasterId, token }) => {
  const [imageUrl, setImageUrl] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async () => {
    if (!imageUrl) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await axios.post(
        `${API_BASE}/disasters/${disasterId}/verify-image`,
        { image_url: imageUrl },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setResult(res.data.result || 'No result');
    } catch (err) {
      console.error(err);
      setError('Image verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Verify Disaster Image</h2>
      <input
        type="text"
        placeholder="Image URL"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
      />
      <button onClick={handleVerify} disabled={loading}>
        {loading ? 'Verifying...' : 'Verify'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {result && <p><strong>Verification Result:</strong> {result}</p>}
    </div>
  );
};

export default ImageVerifyForm;
