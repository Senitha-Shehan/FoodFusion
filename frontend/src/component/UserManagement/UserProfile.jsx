import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const UserProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const userId = localStorage.getItem('userId');

  const getProfileImageUrl = (profilePicture) => {
    if (!profilePicture) return 'https://via.placeholder.com/150';
    
    // If it's already a full URL, return it
    if (profilePicture.startsWith('http')) {
      return profilePicture;
    }
    
    // If it's a relative path, ensure it starts with a forward slash
    const path = profilePicture.startsWith('/') ? profilePicture : `/${profilePicture}`;
    return `http://localhost:8082${path}`;
  };

  const handleImageError = (e) => {
    console.error("Error loading image. Current src:", e.target.src);
    e.target.onerror = null; // Prevent infinite loop
    e.target.src = 'https://via.placeholder.com/150';
  };

  useEffect(() => {
    if (!userId) {
      setError("Please login to view your profile");
      setIsLoading(false);
      navigate("/login");
      return;
    }

    const fetchUserData = async () => {
      try {
        const response = await axios.get(`http://localhost:8082/user/${userId}`, {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        if (response.data) {
          setUser(response.data);
          setEditedUser(response.data);
          if (response.data.profilePicture) {
            const imageUrl = getProfileImageUrl(response.data.profilePicture);
            setPreviewUrl(imageUrl);
          }
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError(err.response?.data?.message || "Failed to fetch user data");
        if (err.response?.status === 401) {
          navigate("/login");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [userId, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUser((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        setError("Please select a valid image file (JPEG, PNG, or GIF)");
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError("File size should be less than 5MB");
        return;
      }

      setProfilePicture(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(""); // Clear any previous errors
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear any previous errors
    
    try {
      // First update user details
      const response = await axios.put(
        `http://localhost:8082/user/${userId}`,
        editedUser,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      // If profile picture is selected, upload it
      if (profilePicture) {
        const formData = new FormData();
        formData.append("file", profilePicture);
        
        try {
          console.log("Uploading profile picture...");
          const uploadResponse = await axios.post(
            `http://localhost:8082/user/${userId}/profile-picture`,
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
              withCredentials: true
            }
          );
          
          console.log("Upload response:", uploadResponse.data);
          
          if (uploadResponse.data.profilePicture) {
            const imageUrl = getProfileImageUrl(uploadResponse.data.profilePicture);
            setPreviewUrl(imageUrl);
            setUser(prev => ({ ...prev, profilePicture: uploadResponse.data.profilePicture }));
          }
        } catch (uploadError) {
          console.error("Error uploading profile picture:", uploadError);
          const errorMessage = uploadError.response?.data?.message || 
                             uploadError.message || 
                             "Error uploading profile picture. Please try again.";
          setError(errorMessage);
          return;
        }
      }

      setUser(response.data);
      setIsEditing(false);
      setProfilePicture(null);
    } catch (err) {
      console.error("Error updating profile:", err);
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          "Failed to update profile. Please try again.";
      setError(errorMessage);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      try {
        await axios.delete(`http://localhost:8082/user/${userId}`, {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        localStorage.removeItem('userId');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
        setError("Account deleted successfully. Redirecting to home page...");
        setTimeout(() => navigate("/"), 2000);
      } catch (err) {
        console.error("Error deleting account:", err);
        setError(err.response?.data?.message || "Error deleting account");
      }
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:8082/logout", {}, {
        withCredentials: true,
      });
      localStorage.removeItem('userId');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userName');
      navigate("/login");
    } catch (err) {
      console.error("Error logging out:", err);
      // Even if the server request fails, we should still log the user out locally
      localStorage.removeItem('userId');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userName');
      navigate("/login");
    }
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

  if (isLoading) {
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
        
        {error && <div style={errorStyle}>{error}</div>}

        {isEditing ? (
          <form onSubmit={handleSubmit} style={formStyle}>
            <div style={imageContainerStyle}>
              <img
                src={previewUrl || getProfileImageUrl(user?.profilePicture)}
                alt="Profile"
                style={profileImageStyle}
                onError={handleImageError}
                crossOrigin="anonymous"
              />
              <input
                type="file"
                id="profilePicture"
                accept="image/*"
                onChange={handleFileChange}
                style={fileInputStyle}
              />
            </div>

            <div style={inputGroupStyle}>
              <label htmlFor="fullname" style={labelStyle}>
                Full Name
              </label>
              <input
                type="text"
                id="fullname"
                name="fullname"
                value={editedUser.fullname}
                onChange={handleInputChange}
                style={inputStyle}
                required
              />
            </div>

            <div style={inputGroupStyle}>
              <label htmlFor="email" style={labelStyle}>
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={editedUser.email}
                onChange={handleInputChange}
                style={inputStyle}
                required
              />
            </div>

            <div style={inputGroupStyle}>
              <label htmlFor="phone" style={labelStyle}>
                Phone
              </label>
              <input
                type="text"
                id="phone"
                name="phone"
                value={editedUser.phone}
                onChange={handleInputChange}
                style={inputStyle}
                required
              />
            </div>

            <div style={buttonGroupStyle}>
              <button type="submit" style={saveButtonStyle}>
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setEditedUser(user);
                  setProfilePicture(null);
                  setPreviewUrl(user.profilePicture ? getProfileImageUrl(user.profilePicture) : null);
                }}
                style={cancelButtonStyle}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div style={profileInfoStyle}>
            <div style={imageContainerStyle}>
              <img
                src={previewUrl || getProfileImageUrl(user?.profilePicture)}
                alt="Profile"
                style={profileImageStyle}
                onError={handleImageError}
                crossOrigin="anonymous"
              />
            </div>

            <div style={infoGroupStyle}>
              <label style={labelStyle}>Full Name</label>
              <p style={infoTextStyle}>{user.fullname}</p>
            </div>

            <div style={infoGroupStyle}>
              <label style={labelStyle}>Email</label>
              <p style={infoTextStyle}>{user.email}</p>
            </div>

            <div style={infoGroupStyle}>
              <label style={labelStyle}>Phone</label>
              <p style={infoTextStyle}>{user.phone}</p>
            </div>

            <div style={buttonGroupStyle}>
              <button
                onClick={() => setIsEditing(true)}
                style={editButtonStyle}
              >
                Edit Profile
              </button>
              <button 
                onClick={() => navigate("/users")}
                style={buttonStyle}
              >
                View Other Users
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
                onClick={handleLogout} 
                style={logoutButtonStyle}
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

// Styles
const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "20px",
};

const profileInfoStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "20px",
};

const imageContainerStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "16px",
  marginBottom: "24px",
};

const profileImageStyle = {
  width: "150px",
  height: "150px",
  borderRadius: "50%",
  objectFit: "cover",
  border: "4px solid #e2e8f0",
};

const fileInputStyle = {
  padding: "8px",
  border: "1px solid #e2e8f0",
  borderRadius: "4px",
  width: "100%",
  maxWidth: "300px",
};

const inputGroupStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
};

const infoGroupStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "4px",
};

const buttonGroupStyle = {
  display: "flex",
  gap: "12px",
  marginTop: "24px",
  flexWrap: "wrap"
};

const editButtonStyle = {
  padding: "12px 24px",
  backgroundColor: "#4299e1",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "16px",
  flex: 1,
};

const saveButtonStyle = {
  ...editButtonStyle,
  backgroundColor: "#48bb78",
};

const cancelButtonStyle = {
  ...editButtonStyle,
  backgroundColor: "#a0aec0",
};

const logoutButtonStyle = {
  ...editButtonStyle,
  backgroundColor: "#f56565",
};

export default UserProfile;