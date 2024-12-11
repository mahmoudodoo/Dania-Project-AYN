import Nav from "../components/Nav";
import Footer from "../components/footer";
import { useEffect, useState } from "react";
import api from "../api"; // Import API for backend interaction
import "../styles/profile.css"; // CSS file for profile page styles
import img from "../assets/crime/user-regular.svg";
import { useNavigate } from "react-router-dom";
export default function Profile() {
  const [savedNews, setSavedNews] = useState([]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [isEditing, setIsEditing] = useState(false); // To track edit mode
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch profile data

    // Fetch saved news
    api
      .get("/api/saved-news/")
      .then((response) => {
        setSavedNews(response.data.saved_news);
        console.log(response.data.saved_news);
      })
      .catch((error) => {
        console.error("Error fetching saved news:", error);
      });

    // Fetch user profile data (first name and last name)
    api
      .get("/api/profile/")
      .then((response) => {
        setFirstName(response.data.first_name); // Assuming response includes first_name
        setLastName(response.data.last_name); // Assuming response includes last_name
        setEmail(response.data.email); // Assuming response includes last_name
        setUsername(response.data.username); // Assuming response includes last_name
      })
      .catch((error) => {
        console.error("Error fetching user profile:", error);
      });
  }, []);

  function handleEdit() {
    setIsEditing(true); // Enable edit mode
  }

  function handleSave() {
    const profileData = {
      first_name: firstName,
      last_name: lastName,
    };

    api
      .patch("/api/profile/", profileData)
      .then((response) => {
        console.log("Profile updated successfully:", response.data);
        setIsEditing(false); // Exit edit mode after saving
      })
      .catch((error) => {
        console.error("Error updating profile:", error);
      });
  }
  const handleReset = async () => {
    setLoading(true);
    try {
      const response = await api.post("/api/reset-password/", { email });
      setMessage(response.data.success);
    } catch (error) {
      setMessage("Error sending reset link");
    } finally {
      setLoading(false);
    }
  };

  function handleCancel() {
    setIsEditing(false); // Exit edit mode without saving
  }

  function Logout() {
    localStorage.clear();
    navigate("/");
  }

  return (
    <div>
      <Nav />
      <div className="profile-container">
        <div className="profile-header">
          <img src={img} alt="Profile" className="profile-pic" />
          <div className="profile-info">
            <h2 className="profile-username">
              {firstName} {lastName}
            </h2>
            <p className="profile-email">{email}</p>
            <p className="profile-email">ID: {username}</p>
            <button className="edit-button" onClick={handleReset}>
              {loading ? "Loading..." : "Reset Password"}
            </button>
            {message && <p>{message}</p>}

            {isEditing ? (
              <>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First Name"
                />
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last Name"
                />
                <button className="save-button" onClick={handleSave}>
                  Save
                </button>
                <button className="cancel-button" onClick={handleCancel}>
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button className="edit-button" onClick={handleEdit}>
                  Edit Profile
                </button>
                <button className="logout-button" onClick={Logout}>
                  Logout
                </button>
              </>
            )}
          </div>
        </div>

        <div className="saved-profile-news-section">
          <h3 className="section-profile-title">
            Saved News ( {savedNews.length} )
          </h3>
          <div className="news-profile-list">
            {savedNews.length === 0 ? (
              <p className="no-saved-news">You have no saved news yet.</p>
            ) : (
              savedNews.map((newsItem) => (
                <div key={newsItem.id} className="news-profile-item">
                  {newsItem.image && (
                    <img
                      src={newsItem.image}
                      alt={newsItem.title}
                      className="news-profile-image"
                    />
                  )}
                  <h4 className="news-profile-title">{newsItem.title}</h4>
                  <p className="news-profile-date">
                    {new Date(newsItem.created).toLocaleDateString()}
                  </p>
                  <p className="news-profile-body">
                    {newsItem.body.length > 100
                      ? `${newsItem.body.slice(0, 100)}...`
                      : newsItem.body}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
