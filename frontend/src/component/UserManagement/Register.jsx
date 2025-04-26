import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Register = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    fullname: "",
    email: "",
    password: "",
    phone: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const { fullname, email, password, phone } = user;

  const onInputChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
    setError("");
  };

  const validateForm = () => {
    if (!fullname.trim()) {
      setError("Full name is required");
      return false;
    }
    if (!email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Please enter a valid email");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    if (!phone.trim()) {
      setError("Phone number is required");
      return false;
    }
    return true;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      await axios.post("http://localhost:8082/user", user);
      alert("User Registered Successfully");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Error registering user");
      console.error("Registration error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Inline styles
  const containerStyle = {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f9fafb",
    padding: "48px 16px"
  };

  const formContainerStyle = {
    maxWidth: "448px",
    width: "100%",
    backgroundColor: "white",
    padding: "32px",
    borderRadius: "8px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
  };

  const headingStyle = {
    textAlign: "center",
    marginBottom: "32px",
    fontSize: "30px",
    fontWeight: "800",
    color: "#1a202c"
  };

  const errorStyle = {
    backgroundColor: "#fed7d7",
    border: "1px solid #feb2b2",
    color: "#9b2c2c",
    padding: "16px",
    borderRadius: "4px",
    marginBottom: "16px"
  };

  const labelStyle = {
    display: "block",
    fontSize: "14px",
    fontWeight: "500",
    color: "#4a5568",
    marginBottom: "8px"
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    marginBottom: "16px",
    borderRadius: "6px",
    border: "1px solid #e2e8f0",
    fontSize: "16px",
    boxShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.075)"
  };

  const buttonStyle = {
    width: "100%",
    padding: "12px",
    backgroundColor: "#4299e1",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "background-color 0.2s",
    marginTop: "8px",
    opacity: isSubmitting ? "0.7" : "1"
  };

  const buttonHoverStyle = {
    backgroundColor: "#3182ce"
  };

  const linkStyle = {
    textAlign: "center",
    fontSize: "14px",
    color: "#718096",
    marginTop: "16px"
  };

  const linkButtonStyle = {
    color: "#4299e1",
    fontWeight: "500",
    textDecoration: "none",
    cursor: "pointer",
    marginLeft: "4px"
  };

  return (
    <div style={containerStyle}>
      <div style={formContainerStyle}>
        <h2 style={headingStyle}>Create an account</h2>
        
        {error && (
          <div style={errorStyle} role="alert">
            {error}
          </div>
        )}
        
        <form onSubmit={onSubmit} style={{ marginTop: "32px" }}>
          <div style={{ marginBottom: "24px" }}>
            <label htmlFor="fullname" style={labelStyle}>
              Full Name
            </label>
            <input
              type="text"
              id="fullname"
              name="fullname"
              onChange={onInputChange}
              value={fullname}
              style={inputStyle}
              required
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label htmlFor="email" style={labelStyle}>
              Email address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              onChange={onInputChange}
              value={email}
              style={inputStyle}
              required
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label htmlFor="password" style={labelStyle}>
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              onChange={onInputChange}
              value={password}
              style={inputStyle}
              required
              minLength="6"
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label htmlFor="phone" style={labelStyle}>
              Phone Number
            </label>
            <input
              type="text"
              id="phone"
              name="phone"
              onChange={onInputChange}
              value={phone}
              style={inputStyle}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={buttonStyle}
            onMouseOver={(e) => !isSubmitting && (e.currentTarget.style.backgroundColor = "#3182ce")}
            onMouseOut={(e) => !isSubmitting && (e.currentTarget.style.backgroundColor = "#4299e1")}
          >
            {isSubmitting ? "Registering..." : "Register"}
          </button>
        </form>

        <div style={linkStyle}>
          Already have an account?{" "}
          <span 
            style={linkButtonStyle}
            onClick={() => navigate("/login")}
          >
            Sign in
          </span>
        </div>
      </div>
    </div>
  );
};

export default Register;