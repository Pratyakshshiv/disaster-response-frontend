// NewsView.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
const NewsView = ({ token }) => {
  const [updates, setUpdates] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const fakeId = "default"; // used just for caching

  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        const res = await axios.get(
          `${API_BASE}/disasters/${fakeId}/official-updates`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setUpdates(res.data.updates || []);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch official updates.");
      } finally {
        setLoading(false);
      }
    };

    fetchUpdates();
  }, [token]);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">📢 Official Disaster Updates</h2>
      {loading && <p>Loading updates...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && updates.length === 0 && <p>No updates available.</p>}
      <ul className="space-y-3">
        {updates.map((update, idx) => (
          <li key={idx} className="border-b pb-2">
            <div>
              <span className="text-gray-700 font-medium">{update.source}</span> -{" "}
              <span>{update.title}</span>
            </div>
            {update.link ? (
              <a
                href={update.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline text-sm"
              >
                Open Link
              </a>
            ) : (
              update.error && <span className="text-red-500 text-sm">{update.error}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NewsView;
