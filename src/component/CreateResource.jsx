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

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Fix Leaflet marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

// 🔵 Custom blue icon for selected marker
const blueIcon = new L.Icon({
  iconUrl: "https://chart.googleapis.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|007bff",
  iconSize: [21, 34],
  iconAnchor: [10, 34],
  popupAnchor: [0, -30],
});

const defaultIcon = new L.Icon.Default();

// 🔁 Marker component
const DisasterMarker = ({ disaster, isSelected, onClick }) => (
  <Marker
    position={[disaster.lat, disaster.lon]}
    icon={isSelected ? blueIcon : defaultIcon}
    eventHandlers={{
      click: () => {
        console.log("📍 Marker clicked:", disaster.title);
        onClick(disaster);
      },
    }}
  >
    <Popup>
      <strong>{disaster.title}</strong>
      <br />
      {disaster.location_name}
    </Popup>
  </Marker>
);

const CreateResource = ({ token }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("shelter");
  const [disasters, setDisasters] = useState([]);
  const [selectedDisaster, setSelectedDisaster] = useState(null);
  const [locationPreview, setLocationPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1 = preview, 2 = submit
  const mapRef = useRef();

  useEffect(() => {
    const fetchDisasters = async () => {
      try {
        const res = await fetch(`${API_BASE}/disasters`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setDisasters(data || []);
      } catch (err) {
        toast.error("Failed to load disasters");
      }
    };
    fetchDisasters();
  }, [token]);

  const handleDisasterClick = (disaster) => {
    console.log("🔥 Disaster selected:", disaster);
    setSelectedDisaster({ ...disaster });
    toast.success(`Selected: ${disaster.title}`);
  };

  const handleClearDisaster = () => {
    setSelectedDisaster(null);
    toast("Selection cleared.");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedDisaster) {
      toast.error("Please select a disaster on the map");
      return;
    }

    if (!title || !description || !type) {
      toast.error("Fill all fields");
      return;
    }

    if (step === 1) {
      // First step: preview location
      setLoading(true);
      setLocationPreview(null);

      try {
        const geoRes = await fetch(`${API_BASE}/geocode`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ description }),
        });

        const geoData = await geoRes.json();
        const loc = geoData.extractedLocations?.[0];
        if (!geoRes.ok || !loc?.lat || !loc?.lon) {
          throw new Error("Location extraction failed");
        }

        setLocationPreview(loc);
        setStep(2);
      } catch (err) {
        console.error("❌ Geocoding error:", err.message);
        toast.error("Geocoding failed");
      } finally {
        setLoading(false);
      }
    } else {
      // Second step: submit data
      try {
        const res = await fetch(`${API_BASE}/resources`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            disaster_id: selectedDisaster.id,
            title,
            description,
            type,
            location_name: locationPreview.location,
            latitude: locationPreview.lat,
            longitude: locationPreview.lon,
          }),
        });

        const data = await res.json();

        if (res.ok) {
          toast.success("✅ Resource created!");
          setTitle("");
          setDescription("");
          setType("shelter");
          setSelectedDisaster(null);
          setLocationPreview(null);
          setTimeout(() => {
          window.location.href = "/all-resources";
        }, 1500);
          setStep(1);
        } else {
          toast.error(data.error || "Creation failed");
        }
      } catch (err) {
        toast.error("Server error");
      }
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">📦 Create Resource</h2>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Inputs */}
        <div>
          <label className="block font-medium">Title</label>
          <input
            type="text"
            className="w-full border px-3 py-2 rounded"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block font-medium">Description</label>
          <textarea
            className="w-full border px-3 py-2 rounded"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            required
          />
        </div>

        <div>
          <label className="block font-medium">Type</label>
          <select
            className="w-full border px-3 py-2 rounded"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="shelter">Shelter</option>
            <option value="food">Food</option>
            <option value="medical">Medical</option>
            <option value="volunteer">Volunteer</option>
          </select>
        </div>

        {/* ✅ Status and Clear Selection */}
        {selectedDisaster && (
          <div className="text-sm flex justify-between items-center">
            <span className="text-green-700">✅ Selected: {selectedDisaster.title}</span>
            <button
              type="button"
              onClick={handleClearDisaster}
              className="text-red-600 underline"
            >
              Clear selection
            </button>
          </div>
        )}

        {/* ✅ Always show submit button */}
        <div>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            {loading ? "Locating..." : step === 1 ? "Preview Location" : "Submit Resource"}
          </button>
        </div>
{/* 📍 Location Preview */}
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
              <Popup>{locationPreview.location}</Popup>
            </Marker>
          </MapContainer>
        </div>
      )}
        {/* 🗺️ Map selection */}
        <div className="mt-4">
          <label className="block font-medium mb-2">Disaster Map</label>
          <div className="border rounded overflow-hidden h-[300px]">
            <MapContainer
              center={[20, 0]}
              zoom={2}
              style={{ height: "100%", width: "100%" }}
              ref={mapRef}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
              {disasters.map((d) =>
                d.lat && d.lon ? (
                  <DisasterMarker
                    key={d.id}
                    disaster={d}
                    isSelected={selectedDisaster?.id === d.id}
                    onClick={handleDisasterClick}
                  />
                ) : null
              )}
            </MapContainer>
          </div>
        </div>
      </form>

      
    </div>
  );
};

export default CreateResource;
