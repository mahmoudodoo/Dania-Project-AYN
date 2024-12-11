import { Link } from "react-router-dom";
import "../styles/home.css"; // Import your CSS file

const VerifyEmail = () => {
  const email = localStorage.getItem("email");
  return (
    <div className="check-email-container">
      <div className="check-email-box">
        <h2 className="email-title">Check your email</h2>
        <p className="email-text">
          We just emailed a confirmation link to <strong>{email}</strong>.
          <br />
          Check your email on this device and click the link to sign in.
        </p>
        <p className="email-resend">
          Didn't receive an email?
          <Link to="/resend-confirmation" className="resend-link">
            Resend Confirmation Link
          </Link>
        </p>
        <Link to="/login">
          <button className="login-button">Go to Login</button>
        </Link>
      </div>
    </div>
  );
};

export default VerifyEmail;
