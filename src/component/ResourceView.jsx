// ResourceView.jsx
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
const ResourceView = ({ token }) => {
  const [disasters, setDisasters] = useState([]);
  const [selectedDisaster, setSelectedDisaster] = useState(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch all disasters on load
  useEffect(() => {
    const fetchDisasters = async () => {
      try {
        const res = await fetch(`${API_BASE}/disasters`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setDisasters(data || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load disasters");
      }
    };
    fetchDisasters();
  }, [token]);

  // Fetch resources for selected disaster
  useEffect(() => {
    if (!selectedDisaster) return;

    const fetchResources = async () => {
      setLoading(true);
      try {
        const { lat, lon, id } = selectedDisaster;
        const url = `${API_BASE}/resources/${id}/resources?lat=${lat}&lon=${lon}`;
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (!Array.isArray(data)) throw new Error("Unexpected response");

        setResources(data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch nearby resources");
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, [selectedDisaster, token]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">📍 Nearby Resources</h2>

      <div className="mb-4">
        <label className="block font-medium mb-1">Select Disaster</label>
        <select
          className="w-full border px-3 py-2 rounded"
          value={selectedDisaster?.id || ""}
          onChange={(e) => {
            const disaster = disasters.find((d) => d.id === e.target.value);
            if (disaster) setSelectedDisaster(disaster);
            else setResources([]);
          }}
        >
          <option value="">-- Select --</option>
          {disasters.map((d) => (
            <option key={d.id} value={d.id}>
              {d.title} ({d.location_name})
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p>Loading nearby resources...</p>
      ) : resources.length === 0 ? (
        <p className="text-gray-600">No resources found nearby.</p>
      ) : (
        <div className="overflow-x-auto mt-4 border rounded">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-2 text-left">Title</th>
                <th className="px-4 py-2 text-left">Type</th>
                <th className="px-4 py-2 text-left">Location</th>
                <th className="px-4 py-2 text-left">Description</th>
              </tr>
            </thead>
            <tbody>
              {resources.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="px-4 py-2">{r.title}</td>
                  <td className="px-4 py-2">{r.type}</td>
                  <td className="px-4 py-2">{r.location_name}</td>
                  <td className="px-4 py-2">{r.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ResourceView;
