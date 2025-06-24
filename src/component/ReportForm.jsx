import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
const ReportForm = ({ token }) => {
  const [disasters, setDisasters] = useState([]);
  const [selectedDisaster, setSelectedDisaster] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [verificationStatus, setVerificationStatus] = useState("pending");
  const [verifying, setVerifying] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch disasters on mount
  useEffect(() => {
    const fetchDisasters = async () => {
      try {
        const res = await fetch(`${API_BASE}/disasters`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setDisasters(data);
      } catch (err) {
        toast.error("Failed to load disasters");
      }
    };
    fetchDisasters();
  }, [token]);

  const handleVerify = async () => {
    if (!imageUrl) return toast.error("Please provide an image URL to verify");
    setVerifying(true);
    setVerificationStatus("pending");

    try {
      const res = await fetch(`${API_BASE}/disasters/verify-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_url: imageUrl }),
      });

      const data = await res.json();
      if (res.ok && data.analysis) {
        const result = data.analysis.toLowerCase().includes("verified") ? "verified" : "rejected";
        setVerificationStatus(result);
        toast.success(`Image ${result}`);
      } else {
        throw new Error(data.error || "Unexpected error");
      }
    } catch (err) {
      console.error("Verify Error:", err);
      toast.error("Image verification failed");
      setVerificationStatus("pending");
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDisaster || !content) {
      return toast.error("Please fill in all fields");
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/disasters/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          disaster_id: selectedDisaster,
          content,
          image_url: imageUrl || null,
          verification_status: verificationStatus || "pending",
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Report submitted successfully");
        setContent("");
        setImageUrl("");
        setVerificationStatus("pending");
        setSelectedDisaster("");
        setTimeout(() => {
          window.location.href = "/all-report";
        }, 1500);
      } else {
        toast.error(data.error || "Submission failed");
      }
    } catch (err) {
      toast.error("Server error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">📝 Submit Report</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Disaster</label>
          <select
            value={selectedDisaster}
            onChange={(e) => setSelectedDisaster(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          >
            <option value="">-- Select a disaster --</option>
            {disasters.map((d) => (
              <option key={d.id} value={d.id}>
                {d.title} ({d.location_name})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium">Report Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            rows={3}
            required
          />
        </div>

        <div>
          <label className="block font-medium">Image URL</label>
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            placeholder="http://example.com/image.jpg"
          />
          <button
            type="button"
            onClick={handleVerify}
            disabled={verifying}
            className="mt-2 bg-yellow-500 text-white px-4 py-1 rounded"
          >
            {verifying ? "Verifying..." : "Verify Image"}
          </button>
          {verificationStatus !== "pending" && (
            <p className="mt-1 text-sm text-gray-700">
              ✅ Status: <strong>{verificationStatus}</strong>
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {submitting ? "Submitting..." : "Submit Report"}
        </button>
      </form>
    </div>
  );
};

export default ReportForm;
