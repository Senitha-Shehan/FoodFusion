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
    if (profilePicture.startsWith('http')) return profilePicture;
    const path = profilePicture.startsWith('/') ? profilePicture : `/${profilePicture}`;
    return `http://localhost:8082${path}`;
  };

  const handleImageError = (e) => {
    e.target.onerror = null;
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
            setPreviewUrl(getProfileImageUrl(response.data.profilePicture));
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
    setEditedUser(prev => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        setError("Please select a valid image file (JPEG, PNG, or GIF)");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError("File size should be less than 5MB");
        return;
      }

      setProfilePicture(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    try {
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

      if (profilePicture) {
        const formData = new FormData();
        formData.append("file", profilePicture);
        
        try {
          const uploadResponse = await axios.post(
            `http://localhost:8082/user/${userId}/profile-picture`,
            formData,
            {
              headers: { 'Content-Type': 'multipart/form-data' },
              withCredentials: true
            }
          );
          
          if (uploadResponse.data.profilePicture) {
            const imageUrl = getProfileImageUrl(uploadResponse.data.profilePicture);
            setPreviewUrl(imageUrl);
            setUser(prev => ({ ...prev, profilePicture: uploadResponse.data.profilePicture }));
          }
        } catch (uploadError) {
          console.error("Error uploading profile picture:", uploadError);
          setError(uploadError.response?.data?.message || 
                  uploadError.message || 
                  "Error uploading profile picture. Please try again.");
          return;
        }
      }

      setUser(response.data);
      setIsEditing(false);
      setProfilePicture(null);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.response?.data?.message || 
              err.message || 
              "Failed to update profile. Please try again.");
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
    } catch (err) {
      console.error("Error logging out:", err);
    } finally {
      localStorage.removeItem('userId');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userName');
      navigate("/login");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
          <p className="text-center">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error && !userId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
          <p className="mb-4 text-center text-red-500">{error}</p>
          <button 
            className="w-full px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
            onClick={() => navigate("/login")}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-2xl p-6 bg-white rounded-lg shadow-md">
        <h1 className="mb-6 text-2xl font-bold text-center text-gray-800">User Profile</h1>
        
        {error && <div className="p-3 mb-4 text-center text-red-500 bg-red-100 rounded">{error}</div>}

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <img
                src={previewUrl || getProfileImageUrl(user?.profilePicture)}
                alt="Profile"
                className="w-32 h-32 rounded-full border-4 border-gray-200 object-cover"
                onError={handleImageError}
                crossOrigin="anonymous"
              />
              <input
                type="file"
                id="profilePicture"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="fullname" className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                id="fullname"
                name="fullname"
                value={editedUser.fullname}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={editedUser.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                type="text"
                id="phone"
                name="phone"
                value={editedUser.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="flex flex-wrap gap-3 pt-4">
              <button 
                type="submit" 
                className="px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
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
                className="px-4 py-2 text-white bg-gray-500 rounded hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col items-center">
              <img
                src={previewUrl || getProfileImageUrl(user?.profilePicture)}
                alt="Profile"
                className="w-32 h-32 rounded-full border-4 border-gray-200 object-cover"
                onError={handleImageError}
                crossOrigin="anonymous"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-500">Full Name</label>
              <p className="text-lg text-gray-800">{user.fullname}</p>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-500">Email</label>
              <p className="text-lg text-gray-800">{user.email}</p>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-500">Phone</label>
              <p className="text-lg text-gray-800">{user.phone}</p>
            </div>

            <div className="flex flex-wrap gap-3 pt-6">
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Edit Profile
              </button>
              <button 
                onClick={() => navigate("/users")}
                className="px-4 py-2 text-white bg-indigo-500 rounded hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                View Other Users
              </button>
              <button 
                onClick={handleDelete}
                className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Delete Account
              </button>
              <button 
                onClick={handleLogout}
                className="px-4 py-2 text-white bg-purple-500 rounded hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
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