import React, { useEffect, useState, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

// Fix Leaflet marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
const DisasterMap = ({ token, onSelectDisaster, role }) => {
  const [disasters, setDisasters] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const mapRef = useRef();
  const markerRefs = useRef({});
  const navigate = useNavigate();

  const fetchDisasters = async () => {
    try {
      const res = await fetch(`${API_BASE}/disasters`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setDisasters(data || []);
    } catch (err) {
      console.error("Failed to fetch disasters:", err);
    }
  };

  useEffect(() => {
    fetchDisasters();
  }, [token]);

  useEffect(() => {
    if (!selectedId || !markerRefs.current[selectedId]) return;

    const marker = markerRefs.current[selectedId];
    const map = mapRef.current;

    if (marker && map) {
      const latlng = marker.getLatLng();
      map.setView(latlng, 10, { animate: true });
      marker.openPopup();
    }
  }, [selectedId]);

  const handleUpdate = (id) => {
    if (role !== "admin") {
      toast.error("Only admin can update disasters");
      return;
    }
    navigate(`/update/${id}`);
  };

  const handleDelete = async (id) => {
    if (role !== "admin") {
      toast.error("Only admin can delete disasters");
      return;
    }

    const confirm = window.confirm("Are you sure you want to delete this disaster?");
    if (!confirm) return;

    try {
      const res = await fetch(`${API_BASE}/disasters/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        toast.success("Disaster deleted");
        fetchDisasters(); // Refresh list
      } else {
        const err = await res.json();
        toast.error(err.error || "Delete failed");
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Server error");
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-1/3 max-w-md bg-white p-4 overflow-y-auto border-r border-gray-300">
        <h2 className="text-xl font-bold mb-4">🌍 Disasters</h2>
        <ul className="space-y-2">
          {disasters.map((d) => (
            <li
              key={d.id}
              className="p-2 border rounded hover:bg-gray-100"
            >
              <div
                className="cursor-pointer"
                onClick={() => {
                  setSelectedId(d.id);
                  onSelectDisaster?.(d);
                }}
              >
                <strong>{d.title}</strong>
                <br />
                <span className="text-sm text-gray-500">
                  {d.location_name}
                </span>
              </div>

              {(
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => handleUpdate(d.id)}
                    className="text-blue-600 underline text-sm"
                  >
                    Update
                  </button>
                  <button
                    onClick={() => handleDelete(d.id)}
                    className="text-red-600 underline text-sm"
                  >
                    Delete
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Map */}
      <div className="flex-1">
        <MapContainer
          center={[20, 0]}
          zoom={2}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%" }}
          whenCreated={(mapInstance) => {
            mapRef.current = mapInstance;
          }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          {disasters.map((d) =>
            d.lat && d.lon ? (
              <Marker
                key={d.id}
                position={[d.lat, d.lon]}
                ref={(ref) => {
                  if (ref) markerRefs.current[d.id] = ref;
                }}
              >
                <Popup>
                  <strong>{d.title}</strong>
                  <br />
                  {d.description}
                  <br />
                  <em>{d.tags?.join(", ")}</em>
                </Popup>
              </Marker>
            ) : null
          )}
        </MapContainer>
      </div>
    </div>
  );
};

export default DisasterMap;
