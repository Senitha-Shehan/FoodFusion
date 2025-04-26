import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const UserProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ 
    fullname: '', 
    email: '', 
    phone: '', 
    password: '' 
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (!userId) {
      setError("Please login to view your profile");
      setLoading(false);
      navigate("/login");
      return;
    }

    const fetchUserData = async () => {
      try {
        const response = await axios.get(`http://localhost:8082/user/${userId}`);
        setUser(response.data);
        setFormData({
          fullname: response.data.fullname,
          email: response.data.email,
          phone: response.data.phone,
          password: '' // Don't pre-fill password for security
        });
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await axios.put(`http://localhost:8082/user/${userId}`, formData);
      setUser(response.data);
      setEditing(false);
      setSuccessMessage("Profile updated successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Error updating profile");
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      try {
        await axios.delete(`http://localhost:8082/user/${userId}`);
        localStorage.removeItem('userId');
        setSuccessMessage("Account deleted successfully. Redirecting to home page...");
        setTimeout(() => navigate("/"), 2000);
      } catch (err) {
        setError(err.response?.data?.message || "Error deleting account");
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userId');
    navigate("/login");
  };

  // Inline styles
  const containerStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#f5f5f5",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  };

  const cardStyle = {
    width: "100%",
    maxWidth: "600px",
    padding: "32px",
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
  };

  const headingStyle = {
    margin: "0 0 24px 0",
    fontSize: "24px",
    fontWeight: "600",
    color: "#333333",
    textAlign: "center"
  };

  const labelStyle = {
    display: "block",
    marginBottom: "8px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#444444"
  };

  const inputStyle = {
    width: "100%",
    padding: "12px",
    marginBottom: "16px",
    border: "1px solid #dddddd",
    borderRadius: "6px",
    fontSize: "16px",
    boxSizing: "border-box"
  };

  const buttonStyle = {
    padding: "12px 24px",
    marginRight: "12px",
    backgroundColor: "#007bff",
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "background-color 0.3s ease"
  };

  const buttonHoverStyle = {
    backgroundColor: "#0069d9"
  };

  const secondaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#6c757d"
  };

  const dangerButtonStyle = {
    ...buttonStyle,
    backgroundColor: "#dc3545"
  };

  const infoTextStyle = {
    margin: "8px 0",
    fontSize: "16px",
    color: "#333333"
  };

  const errorStyle = {
    color: "#dc3545",
    fontSize: "14px",
    margin: "16px 0",
    textAlign: "center"
  };

  const successStyle = {
    color: "#28a745",
    fontSize: "14px",
    margin: "16px 0",
    textAlign: "center"
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <p style={{ textAlign: "center" }}>Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <p style={errorStyle}>{error}</p>
          <button 
            style={buttonStyle} 
            onClick={() => navigate("/login")}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={headingStyle}>User Profile</h1>
        
        {successMessage && <div style={successStyle}>{successMessage}</div>}
        {error && <div style={errorStyle}>{error}</div>}

        {editing ? (
          <form onSubmit={handleUpdate}>
            <div>
              <label htmlFor="fullname" style={labelStyle}>Full Name</label>
              <input
                type="text"
                id="fullname"
                name="fullname"
                value={formData.fullname}
                onChange={handleChange}
                style={inputStyle}
                required
              />
            </div>

            <div>
              <label htmlFor="email" style={labelStyle}>Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                style={inputStyle}
                required
              />
            </div>

            <div>
              <label htmlFor="phone" style={labelStyle}>Phone</label>
              <input
                type="text"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                style={inputStyle}
                required
              />
            </div>

            <div>
              <label htmlFor="password" style={labelStyle}>New Password (leave blank to keep current)</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                style={inputStyle}
                placeholder="Enter new password"
              />
            </div>

            <div style={{ marginTop: "24px" }}>
              <button 
                type="submit" 
                style={buttonStyle}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#0069d9"}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#007bff"}
              >
                Save Changes
              </button>
              <button 
                type="button" 
                style={secondaryButtonStyle}
                onClick={() => setEditing(false)}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#5a6268"}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#6c757d"}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div>
            <p style={infoTextStyle}><strong>Name:</strong> {user.fullname}</p>
            <p style={infoTextStyle}><strong>Email:</strong> {user.email}</p>
            <p style={infoTextStyle}><strong>Phone:</strong> {user.phone}</p>
            
            <div style={{ marginTop: "24px" }}>
              <button 
                style={buttonStyle}
                onClick={() => setEditing(true)}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#0069d9"}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#007bff"}
              >
                Edit Profile
              </button>
              <button 
                style={dangerButtonStyle}
                onClick={handleDelete}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#c82333"}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#dc3545"}
              >
                Delete Account
              </button>
              <button 
                style={secondaryButtonStyle}
                onClick={handleLogout}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#5a6268"}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#6c757d"}
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;