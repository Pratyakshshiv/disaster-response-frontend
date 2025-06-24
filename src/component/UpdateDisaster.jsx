// UpdateDisaster.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
const UpdateDisaster = ({ token, role }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [disaster, setDisaster] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [title, setTitle] = useState("");
  const [locationName, setLocationName] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");

  useEffect(() => {
    if (role !== "admin") {
      setError("Only admins can update disasters.");
      return;
    }

    const fetchDisaster = async () => {
      try {
        const res = await fetch(`${API_BASE}/disasters/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setDisaster(data);
        setTitle(data.title);
        setLocationName(data.location_name);
        setDescription(data.description);
        setTags(data.tags?.join(", "));
      } catch (err) {
        setError("Failed to load disaster.");
      }
    };

    fetchDisaster();
  }, [id, role, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const res = await fetch(`${API_BASE}/disasters/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          location_name: locationName,
          description,
          tags: tags.split(",").map((t) => t.trim()),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Disaster updated successfully.");
        setTimeout(() => navigate("/"), 1500);
      } else {
        setError(data.error || "Update failed.");
      }
    } catch (err) {
      setError("Request failed.");
    }
  };

  if (role !== "admin") return <p className="text-red-600 p-4">{error}</p>;

  if (!disaster) return <p className="p-4">Loading disaster details...</p>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">✏️ Update Disaster</h2>
      {error && <p className="text-red-600 mb-2">{error}</p>}
      {message && <p className="text-green-600 mb-2">{message}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Title</label>
          <input
            className="w-full border px-3 py-2 rounded"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Location</label>
          <input
            className="w-full border px-3 py-2 rounded"
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Description</label>
          <textarea
            className="w-full border px-3 py-2 rounded"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Tags (comma-separated)</label>
          <input
            className="w-full border px-3 py-2 rounded"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default UpdateDisaster;
