// ReportList.jsx
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import io from 'socket.io-client';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
const socket = io(`${API_BASE}`);

const ReportList = ({ token }) => {
  const [reports, setReports] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchReports = async () => {
    try {
      const res = await fetch(`${API_BASE}/disasters/list/report${statusFilter ? `?status=${statusFilter}` : ''}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setReports(data || []);
    } catch (err) {
      toast.error('Failed to fetch reports');
    }
  };

  useEffect(() => {
    fetchReports();
  }, [statusFilter]);

  useEffect(() => {
    socket.on('report_updated', (report) => {
      toast.success('New report received!');
      fetchReports();
    });
    return () => socket.off('report_updated');
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">📝 Submitted Reports</h2>

      <label className="block mb-2 font-medium">
        Filter by Status:
        <select
          className="ml-2 border px-2 py-1 rounded"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All</option>
          <option value="verified">Verified</option>
          <option value="rejected">Rejected</option>
          <option value="pending">Pending</option>
        </select>
      </label>

      <table className="w-full border mt-4">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2 py-1">User</th>
            <th className="border px-2 py-1">Content</th>
            <th className="border px-2 py-1">Image</th>
            <th className="border px-2 py-1">Status</th>
            <th className="border px-2 py-1">Time</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((r) => (
            <tr key={r.id}>
              <td className="border px-2 py-1">{r.user_id}</td>
              <td className="border px-2 py-1">{r.content}</td>
              <td className="border px-2 py-1">
                {r.image_url ? (
                  <a href={r.image_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                    View
                  </a>
                ) : (
                  '-'
                )}
              </td>
              <td className="border px-2 py-1">{r.verification_status}</td>
              <td className="border px-2 py-1 text-xs text-gray-600">
                {new Date(r.created_at).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReportList;
