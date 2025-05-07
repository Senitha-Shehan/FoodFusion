import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const UserList = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [followingStatus, setFollowingStatus] = useState({});
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const currentUserId = localStorage.getItem('userId');

  useEffect(() => {
    if (!currentUserId) {
      navigate('/login');
      return;
    }

    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:8082/user', {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        // Filter out current user
        const otherUsers = response.data.filter(user => user.id !== parseInt(currentUserId));
        setUsers(otherUsers);

        // Check follow status for each user
        const statusPromises = otherUsers.map(user =>
          axios.get(`http://localhost:8082/user/${currentUserId}/is-following/${user.id}`, {
            withCredentials: true
          })
        );

        const statusResults = await Promise.all(statusPromises);
        const statusMap = {};
        otherUsers.forEach((user, index) => {
          statusMap[user.id] = statusResults[index].data.isFollowing;
        });
        setFollowingStatus(statusMap);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [currentUserId, navigate]);

  const handleFollow = async (targetUserId) => {
    try {
      await axios.post(
        `http://localhost:8082/user/${currentUserId}/follow/${targetUserId}`,
        {},
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      setFollowingStatus(prev => ({
        ...prev,
        [targetUserId]: true
      }));
    } catch (err) {
      console.error('Error following user:', err);
      setError('Failed to follow user. Please try again.');
    }
  };

  const handleUnfollow = async (targetUserId) => {
    try {
      // First check if we're actually following the user
      const statusResponse = await axios.get(
        `http://localhost:8082/user/${currentUserId}/is-following/${targetUserId}`,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      if (!statusResponse.data.isFollowing) {
        setError('You are not following this user');
        return;
      }

      // Proceed with unfollow
      const response = await axios.delete(
        `http://localhost:8082/user/${currentUserId}/unfollow/${targetUserId}`,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      if (response.data.message) {
        setFollowingStatus(prev => ({
          ...prev,
          [targetUserId]: false
        }));
        setError(''); // Clear any existing errors
      }
    } catch (err) {
      console.error('Error unfollowing user:', err);
      
      // Handle specific error cases
      if (err.response) {
        switch (err.response.status) {
          case 400:
            setError(err.response.data.message || 'Invalid request');
            break;
          case 404:
            setError('User not found');
            break;
          case 500:
            setError('Server error occurred. Please try again later.');
            break;
          default:
            setError('Failed to unfollow user. Please try again.');
        }
      } else if (err.request) {
        setError('No response from server. Please check your connection.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }

      // Refresh the follow status
      try {
        const statusResponse = await axios.get(
          `http://localhost:8082/user/${currentUserId}/is-following/${targetUserId}`,
          {
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          }
        );
        setFollowingStatus(prev => ({
          ...prev,
          [targetUserId]: statusResponse.data.isFollowing
        }));
      } catch (statusErr) {
        console.error('Error refreshing follow status:', statusErr);
      }
    }
  };

  const getProfileImageUrl = (profilePicture) => {
    if (!profilePicture) return 'https://via.placeholder.com/50';
    
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
    e.target.src = 'https://via.placeholder.com/50';
  };

  if (isLoading) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <p style={{ textAlign: 'center' }}>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={headingStyle}>Other Users</h1>
        {error && <div style={errorStyle}>{error}</div>}
        <div style={userListStyle}>
          {users.map(user => (
            <div key={user.id} style={userCardStyle}>
              <img
                src={getProfileImageUrl(user.profilePicture)}
                alt={user.fullname}
                style={profileImageStyle}
                onError={handleImageError}
                crossOrigin="anonymous"
              />
              <div style={userInfoStyle}>
                <h3 style={userNameStyle}>{user.fullname}</h3>
                <p style={userEmailStyle}>{user.email}</p>
              </div>
              <button
                onClick={() => followingStatus[user.id] ? handleUnfollow(user.id) : handleFollow(user.id)}
                style={{
                  ...followButtonStyle,
                  backgroundColor: followingStatus[user.id] ? '#dc3545' : '#28a745'
                }}
              >
                {followingStatus[user.id] ? 'Unfollow' : 'Follow'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Styles
const containerStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh',
  backgroundColor: '#f5f5f5',
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
};

const cardStyle = {
  width: '100%',
  maxWidth: '800px',
  padding: '32px',
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
};

const headingStyle = {
  margin: '0 0 24px 0',
  fontSize: '24px',
  fontWeight: '600',
  color: '#333333',
  textAlign: 'center'
};

const errorStyle = {
  color: '#dc3545',
  fontSize: '14px',
  margin: '16px 0',
  textAlign: 'center'
};

const userListStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px'
};

const userCardStyle = {
  display: 'flex',
  alignItems: 'center',
  padding: '16px',
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
  gap: '16px'
};

const profileImageStyle = {
  width: '50px',
  height: '50px',
  borderRadius: '50%',
  objectFit: 'cover'
};

const userInfoStyle = {
  flex: 1
};

const userNameStyle = {
  margin: '0 0 4px 0',
  fontSize: '16px',
  fontWeight: '600',
  color: '#333333'
};

const userEmailStyle = {
  margin: '0',
  fontSize: '14px',
  color: '#666666'
};

const followButtonStyle = {
  padding: '8px 16px',
  border: 'none',
  borderRadius: '4px',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '500',
  cursor: 'pointer',
  transition: 'background-color 0.3s ease'
};

export default UserList; 