import { useState } from "react";
import api from "../api"; // Assuming this is the axios instance
import { useNavigate } from "react-router-dom";
import "../styles/verifypage.css"; // Import the CSS file for styling

const VerifyCodePage = () => {
  const [code, setCode] = useState(new Array(6).fill("")); // Array for six input boxes
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const username = localStorage.getItem("username"); // Username stored during login

  // Handle input change for each box
  const handleChange = (value, index) => {
    let newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Move focus to the next box when a value is entered
    if (value && index < 5) {
      document.getElementById(`code-box-${index + 1}`).focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const verificationCode = code.join(""); // Combine all boxes into one string

    try {
      const response = await api.post("/api/token/verify-code/", {
        username,
        code: verificationCode,
      });

      if (response.data) {
        // Store tokens after successful verification
        localStorage.setItem("access", response.data.access);
        localStorage.setItem("refresh", response.data.refresh);

        // Redirect to the home page after successful verification
        navigate("/home");
      }
    } catch (error) {
      setError("Invalid verification code. Please try again.");
      console.error("Error verifying the code:", error);
    }
  };

  return (
    <div className="verification-code-container">
      <h2>Enter Verification Code</h2>
      <form onSubmit={handleSubmit}>
        <div className="code-inputs">
          {code.map((digit, index) => (
            <input
              key={index}
              id={`code-box-${index}`}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(e.target.value, index)}
              className="code-box"
            />
          ))}
        </div>
        {error && <p className="error">{error}</p>}
        <button type="submit" className="verify-button">
          Verify
        </button>
      </form>
    </div>
  );
};

export default VerifyCodePage;
