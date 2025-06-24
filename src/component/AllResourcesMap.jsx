import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import toast from "react-hot-toast";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
// Fix Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const AllResourcesMap = ({ token }) => {
  const [resources, setResources] = useState([]);
  const mapRef = useRef();

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const res = await fetch(`${API_BASE}/resources/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setResources(data);
      } catch (err) {
        console.error("❌ Failed to load resources", err);
        toast.error("Failed to load resources");
      }
    };
    fetchResources();
  }, [token]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">🗺️ All Submitted Resources</h2>

      <div className="h-[500px] border rounded overflow-hidden">
        <MapContainer
          center={[20, 0]}
          zoom={2}
          scrollWheelZoom
          style={{ height: "100%", width: "100%" }}
          ref={mapRef}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />

          {resources.map((r) => (
            <Marker key={r.id} position={[r.lat, r.lon]}>
              <Popup>
                <strong>{r.title}</strong>
                <br />
                <em>{r.type}</em>
                <br />
                <span>{r.location_name}</span>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default AllResourcesMap;
