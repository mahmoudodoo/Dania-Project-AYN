import { useState } from "react";
import api from "../api";
import "../styles/Form.css"; // Import the CSS file

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleResetPassword = async () => {
    try {
      const response = await api.post("/api/reset-password/", { email });
      setMessage(response.data.success);
    } catch (error) {
      setMessage("Error sending reset link");
    }
  };

  return (
    <div className="form-page-container">
      <div className="form-left">
        <div className="form-container">
          <h1 className="form-title">Reset Password</h1>
          <input
            className="form-input"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button className="form-button" onClick={handleResetPassword}>
            Send Reset Link
          </button>
          {message && <p className="message">{message}</p>}
        </div>
      </div>
      <div className="background-right">
        {/* Background image is set via CSS */}
      </div>
    </div>
  );
};

export default ResetPassword;
