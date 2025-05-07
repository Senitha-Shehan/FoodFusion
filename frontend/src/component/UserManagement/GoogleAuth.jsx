import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const GoogleAuth = () => {
  const navigate = useNavigate();

  const handleSuccess = async (credentialResponse) => {
    try {
      // Decode the credential to get user info
      const decodedToken = JSON.parse(atob(credentialResponse.credential.split('.')[1]));
      
      // Send the credential to your backend
      const response = await axios.post(
        "http://localhost:8082/oauth2/google",
        {
          credential: credentialResponse.credential,
          email: decodedToken.email,
          name: decodedToken.name,
          picture: decodedToken.picture
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          withCredentials: true
        }
      );

      if (response.data.id) {
        localStorage.setItem("userId", response.data.id);
        localStorage.setItem("userEmail", response.data.email);
        localStorage.setItem("userName", response.data.fullname);
        navigate("/userProfile");
      } else {
        console.error("Invalid response from server");
        alert("Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Error during Google login:", error);
      if (error.response?.status === 401) {
        alert("Authentication failed. Please try again.");
      } else if (error.response?.status === 403) {
        alert("Access denied. Please check your Google account permissions.");
      } else {
        alert("An error occurred during login. Please try again later.");
      }
    }
  };

  const handleError = () => {
    console.error("Google Login Failed");
    alert("Google login failed. Please try again or use a different account.");
  };

  return (
    <GoogleOAuthProvider clientId="465047861520-hujee93ih0vm7pok4423i5bufbehf9vr.apps.googleusercontent.com">
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={handleError}
          useOneTap
          theme="outline"
          size="large"
          text="signin_with"
          shape="rectangular"
          type="standard"
          context="signin"
          flow="implicit"
        />
      </div>
    </GoogleOAuthProvider>
  );
};

export default GoogleAuth;
