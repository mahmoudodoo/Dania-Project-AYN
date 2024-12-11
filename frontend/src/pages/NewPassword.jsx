import { useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../api";
import "../styles/Form.css"; // Reuse the same CSS

const NewPassword = () => {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const token = params.get("token");
  const email = params.get("email");

  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    try {
      await api.patch(`/api/reset-password/${token}/`, {
        email,
        password: newPassword,
      });
      setMessage("Password reset successful");
    } catch (error) {
      setMessage("Error resetting password");
    }
  };

  return (
    <div className="form-page-container">
      <div className="form-left">
        <div className="form-container">
          <h1 className="form-title">Set New Password</h1>
          <input
            className="form-input"
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <button className="form-button" onClick={handleSubmit}>
            Reset Password
          </button>
          {message && <p className="message">{message}</p>}
        </div>
      </div>
      <div className="background-right">
        {/* The background image will be set via CSS */}
      </div>
    </div>
  );
};

export default NewPassword;
