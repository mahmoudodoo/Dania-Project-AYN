import { useState } from "react";
import api from "../api"; // Your Axios API setup
import Nav from "../components/Nav";
import Footer from "../components/footer";
import {
  GoogleMap,
  LoadScript,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";
import "../styles/predict.css"; // Add a CSS file for styling

const CrimePredict = () => {
  const [community, setCommunity] = useState("");
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [isMarkerClicked, setIsMarkerClicked] = useState(false); // For showing the info box

  const handleSearch = async (e) => {
    e.preventDefault();
    setResults(null);
    setError(null);
    setIsMarkerClicked(false); // Reset marker click

    try {
      const response = await api.post("/api/community_data/", { community });
      setResults(response.data);
      scrollToMap(); // Scroll down to map after the search
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.error);
      } else {
        setError("An error occurred. Please try again.");
      }
    }
  };

  // Smoothly scroll to the map
  const scrollToMap = () => {
    const mapElement = document.getElementById("crime-map");
    if (mapElement) {
      mapElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div id="Crime-predict">
      <Nav></Nav>

      <div className="crime-predict-page">
        <div className="crime-search-container">
          <h1 className="crime-predict-title">Chicago Crime Data Search</h1>
          <p className="crime-description">
            Enter a community name to find crime data in Chicago. Discover the
            crime rate, common crimes, and more for specific areas.
          </p>

          <form onSubmit={handleSearch} className="crime-search-form">
            <div className="search-input-group">
              <input
                type="text"
                id="community"
                name="community"
                value={community}
                onChange={(e) => setCommunity(e.target.value)}
                placeholder="e.g. Rogers Park"
                required
                className="search-input"
              />
              <button type="submit" className="search-button">
                Search
              </button>
            </div>
          </form>

          {/* Display error message if exists */}
          {error && <p className="error-message">{error}</p>}
        </div>

        {/* Google Map Section */}
        <div id="crime-map" className="crime-map-container">
          <LoadScript googleMapsApiKey="AIzaSyDfbSZYW2SCk2ORvFXeTDAbxLsMbLx4w34">
            <GoogleMap
              mapContainerStyle={{ width: "100%", height: "500px" }}
              center={
                results
                  ? { lat: results.lat, lng: results.lon }
                  : { lat: 41.8781, lng: -87.6298 }
              }
              zoom={12}
            >
              {results && (
                <Marker
                  position={{ lat: results.lat, lng: results.lon }}
                  onClick={() => setIsMarkerClicked(true)}
                  title={results.name}
                />
              )}

              {/* Show InfoWindow when the marker is clicked */}
              {isMarkerClicked && results && (
                <InfoWindow
                  position={{ lat: results.lat, lng: results.lon }}
                  onCloseClick={() => setIsMarkerClicked(false)}
                >
                  <div className="info-window">
                    <h2>{results.name}</h2>
                    <p>Total Crimes: {results.total_crimes}</p>
                    <p>Crime Rate: {results.crime_rate}</p>
                    <p>Description: {results.description}</p>
                    <p>Most Common Crime: {results.common_crime}</p>
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          </LoadScript>
        </div>
      </div>
      <Footer></Footer>
    </div>
  );
};

export default CrimePredict;
