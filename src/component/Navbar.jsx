import { Link, useNavigate } from "react-router-dom";

const Navbar = ({ isLoggedIn, onLogout, username,role }) => {
  const navigate = useNavigate();

  const handleAuthClick = () => {
    if (isLoggedIn) {
      onLogout();
    } else {
      navigate('/login');
    }
  };

  return (
    <nav style={{ padding: "1rem", background: "#222", color: "#fff" }}>
      <ul style={{ display: "flex", alignItems: "center", gap: "1rem", listStyle: "none", margin: 0 }}>
        <li><Link to="/" style={{ color: "#fff", textDecoration: "none" }}>Disaster Map</Link></li>
        <li><Link to="/create" style={{ color: "#fff", textDecoration: "none" }}>Create Disaster</Link></li>
        <li><Link to="/report" style={{ color: "#fff", textDecoration: "none" }}>Create Report</Link></li>
        <li><Link to="/all-report" style={{ color: "#fff", textDecoration: "none" }}>All Reports</Link></li>
        <li><Link to="/social/yhg" style={{ color: "#fff", textDecoration: "none" }}>Social Media</Link></li>
        <li><Link to="/all-resources" style={{ color: "#fff", textDecoration: "none" }}>All Resources</Link></li>
        <li><Link to="/resources" style={{ color: "#fff", textDecoration: "none" }}>Nearest Resources</Link></li>
        <li><Link to="/create-resource" style={{ color: "#fff" }}>Add Resource</Link></li> 
        <li><Link to="/news" style={{ color: "#fff", textDecoration: "none" }}>News</Link></li>
        <li style={{ marginLeft: "auto", color: "#ccc", fontStyle: "italic" }}>
          {isLoggedIn ? `Logged in as: ${username} (${role})` : "Not logged in"}
        </li>
        <li>
          <button
            onClick={handleAuthClick}
            style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}
          >
            {isLoggedIn ? "Logout" : "Login"}
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
