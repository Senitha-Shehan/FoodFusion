import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await axios.post("http://localhost:8082/login", {
        email,
        password
      });

      if (response.data.id) {
        localStorage.setItem("userId", response.data.id);
        navigate("/userProfile");
      } else {
        setError("Invalid email or password");
      }
    } catch (err) {
      setError(err.response?.data?.Message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
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

  const formContainerStyle = {
    width: "100%",
    maxWidth: "400px",
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
    boxSizing: "border-box",
    transition: "border-color 0.3s ease",
  };

  const inputFocusStyle = {
    outline: "none",
    borderColor: "#007bff",
    boxShadow: "0 0 0 2px rgba(0, 123, 255, 0.25)"
  };

  const buttonStyle = {
    width: "100%",
    padding: "12px",
    backgroundColor: "#007bff",
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
    marginTop: "8px"
  };

  const buttonHoverStyle = {
    backgroundColor: "#0069d9"
  };

  const buttonDisabledStyle = {
    backgroundColor: "#cccccc",
    cursor: "not-allowed"
  };

  const errorStyle = {
    color: "#dc3545",
    fontSize: "14px",
    margin: "8px 0 16px 0",
    textAlign: "center"
  };

  const linkStyle = {
    display: "block",
    textAlign: "center",
    marginTop: "16px",
    color: "#666666",
    fontSize: "14px"
  };

  const registerLinkStyle = {
    color: "#007bff",
    textDecoration: "none",
    fontWeight: "500",
    marginLeft: "4px",
    cursor: "pointer"
  };

  return (
    <div style={containerStyle}>
      <div style={formContainerStyle}>
        <h1 style={headingStyle}>Login to Your Account</h1>
        
        {error && <div style={errorStyle}>{error}</div>}
        
        <form onSubmit={onSubmit}>
          <div>
            <label htmlFor="email" style={labelStyle}>Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle}
              onFocus={(e) => e.target.style = {...inputStyle, ...inputFocusStyle}}
              onBlur={(e) => e.target.style = inputStyle}
            />
          </div>
          
          <div>
            <label htmlFor="password" style={labelStyle}>Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={inputStyle}
              onFocus={(e) => e.target.style = {...inputStyle, ...inputFocusStyle}}
              onBlur={(e) => e.target.style = inputStyle}
            />
          </div>
          
          <button
            type="submit"
            style={{
              ...buttonStyle,
              ...(isLoading ? buttonDisabledStyle : {}),
              ...(!isLoading ? {':hover': buttonHoverStyle} : {})
            }}
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>
        
        <div style={linkStyle}>
          Don't have an account?{" "}
          <span 
            style={registerLinkStyle}
            onClick={() => navigate("/register")}
          >
            Register
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;