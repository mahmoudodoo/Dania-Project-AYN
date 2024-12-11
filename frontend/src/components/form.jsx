import { useState, useRef, useEffect } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import "../styles/Form.css";
import { Link } from "react-router-dom";

// eslint-disable-next-line react/prop-types
function Form({ route, method }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState(""); // New state for first name
  const [lastName, setLastName] = useState(""); // New state for last name
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [faceVerified, setFaceVerified] = useState(false); // New state for face verification
  const navigate = useNavigate();
  const name = method === "login" ? "Login" : "Register";
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Function to capture the photo from the video

  // Function to handle face verification
  const handleFaceVerification = async () => {
    setLoading(true);
    try {
      const photoBlob = await capturePhoto();

      // Check if the blob is valid
      if (!photoBlob) {
        alert("No photo captured. Please try again.");
        return false;
      }

      // Create a form data object to send the images to the face_verify endpoint
      const formData = new FormData();
      formData.append("image1", photoBlob, "face1.jpg"); // Provide a filename
      formData.append("image2", photoBlob, "face2.jpg"); // Simulating comparison with the same image for registration
      formData.append("username", username);
      console.log("Form Data:", Array.from(formData.entries()));
      // Send the photo to the face_verify API endpoint
      const res = await api.post("/face_verify/", formData, {
        headers: {
          "Content-Type": "multipart/form-data", // Ensure the content type is set correctly
        },
      });
      console.log("Form Data:", Array.from(formData.entries()));
      if (res.data.message === "Face Matched") {
        setFaceVerified(true); // Mark the face as verified
        return true;
      } else {
        alert("Face not matched. Please try again.");
        return false;
      }
    } catch (error) {
      console.error("Error during face verification:", error);
      alert("Face verification failed. Please check the console for details.");
      return false;
    } finally {
      setLoading(false);
    }
  };
  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Draw the video frame onto the canvas
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob && blob.size > 0) {
          resolve(blob);
        } else {
          resolve(null); // Handle failure to create blob
        }
      }, "image/jpeg");
    });
  };

  // Handle the registration/login form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // First verify the face before proceeding
    const isFaceVerified = await handleFaceVerification();
    if (!isFaceVerified) {
      setLoading(false);
      return;
    }

    try {
      const payload = { username, password, email };

      if (method === "register") {
        payload.first_name = firstName; // Include first name in payload
        payload.last_name = lastName; // Include last name in payload
      }

      const res = await api.post(route, payload);

      if (method === "login") {
        if (res.data.message === "Verification code sent to your email") {
          localStorage.setItem("username", username);
          localStorage.setItem("first_name", res.data.first_name);
          localStorage.setItem("last_name", res.data.last_name);
          navigate("/verify-code"); // Redirect to verification code page
        }
      } else {
        localStorage.setItem("first_name", firstName);
        localStorage.setItem("last_name", lastName);
        localStorage.setItem("email", email);
        navigate("/verify-email"); // Redirect to login after successful registration
      }
    } catch (error) {
      console.error("Error during form submission: ", error);
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Start the video stream when the component mounts
  const startVideoStream = async () => {
    const video = videoRef.current;
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = stream;
      video.play();
    }
  };

  // Initialize the video when the component mounts
  useEffect(() => {
    startVideoStream();
  }, []);

  return (
    <div className="form-page-container">
      <div className="form-left">
        <form onSubmit={handleSubmit} className="form-container">
          <h1 className="form-title">{name}</h1>

          <input
            className="form-input"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="User ID"
          />

          {method === "register" && (
            <>
              <input
                className="form-input"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First Name"
              />
              <input
                className="form-input"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last Name"
              />
            </>
          )}

          <input
            className="form-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />

          <input
            className="form-input"
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
          />

          <div className="photo-div">
            <video ref={videoRef} style={{ display: "none" }}></video>
            <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
          </div>

          <button className="form-button" type="submit" disabled={loading}>
            {loading ? "Loading..." : name}
          </button>
          {method === "login" ? (
            <>
              <Link to={"/verify-reset"}>
                <p className="forgot">Forgot Password?</p>
              </Link>
              <Link to={"/register"}>
                <p className="create-acc">Create Account?</p>
              </Link>
            </>
          ) : (
            <Link to={"/login"}>
              <p className="create-acc">Already Have Account?</p>
            </Link>
          )}
        </form>
      </div>
      <div className="background-right">
        {/* The background image will be set via CSS */}
      </div>
    </div>
  );
}

export default Form;
