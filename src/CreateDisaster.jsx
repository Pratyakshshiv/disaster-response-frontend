// --- FRONTEND: CreateDisaster.jsx ---
import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Leaflet icon fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
const CreateDisaster = ({ token }) => {
  const [title, setTitle] = useState("");
  const [locationName, setLocationName] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [locationPreview, setLocationPreview] = useState(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (locationName.trim()) {
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationName)}`)
          .then((res) => res.json())
          .then((data) => {
            if (data && data.length > 0) {
              setLocationPreview({
                lat: parseFloat(data[0].lat),
                lon: parseFloat(data[0].lon),
              });
            } else {
              setLocationPreview(null);
            }
          })
          .catch(() => setLocationPreview(null));
      }
    }, 600);
    return () => clearTimeout(timeout);
  }, [locationName]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (!token) {
      setError("You must be logged in to create disasters.");
      return;
    }
    if (!title || !locationName || !description) {
      setError("Please fill in all required fields.");
      return;
    }
    if (!locationPreview) {
      setError("Invalid location. Please enter a valid place.");
      return;
    }

    setIsSubmitting(true);

    const body = {
      title,
      location_name: locationName,
      description,
      tags: tags.split(",").map((tag) => tag.trim()),
    };

    try {
      const res = await fetch(`${API_BASE}/disasters`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Disaster created successfully!");
        setTitle("");
        setLocationName("");
        setDescription("");
        setTags("");
        setLocationPreview(null);
        setTimeout(() => {
          window.location.href = "/";
        }, 1500);
      } else {
        setError(data.error || "Error creating disaster.");
      }
    } catch (err) {
      setError("Request failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">🌍 Report a New Disaster</h2>
      {message && <div className="bg-green-100 text-green-800 px-4 py-2 rounded mb-4">{message}</div>}
      {error && <div className="bg-red-100 text-red-800 px-4 py-2 rounded mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Title</label>
          <input
            type="text"
            className={`w-full border px-3 py-2 rounded ${!title && error ? "border-red-500" : "border-gray-300"}`}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Location (Name or Address)</label>
          <input
            type="text"
            className={`w-full border px-3 py-2 rounded ${!locationName && error ? "border-red-500" : "border-gray-300"}`}
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Description</label>
          <textarea
            className={`w-full border px-3 py-2 rounded ${!description && error ? "border-red-500" : "border-gray-300"}`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Tags (comma-separated)</label>
          <input
            type="text"
            className="w-full border border-gray-300 px-3 py-2 rounded"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit Disaster"}
        </button>
      </form>

      {locationPreview && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">📍 Location Preview</h3>
          <MapContainer
            center={[locationPreview.lat, locationPreview.lon]}
            zoom={13}
            scrollWheelZoom={false}
            style={{ height: "300px", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            <Marker position={[locationPreview.lat, locationPreview.lon]}>
              <Popup>Location Preview</Popup>
            </Marker>
          </MapContainer>
        </div>
      )}
    </div>
  );
};

export default CreateDisaster;
