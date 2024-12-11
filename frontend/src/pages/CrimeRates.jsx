import { useState, useEffect, useRef } from "react";
import api from "../api"; // Import Axios instance
import Nav from "../components/Nav";
import Footer from "../components/footer";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "../styles/crime-popup.css";

const CrimeMap = () => {
  const [crimeData, setCrimeData] = useState([]); // Store fetched data
  const [page, setPage] = useState(1); // Pagination state
  const [loading, setLoading] = useState(true); // Loading state
  const [hasMore, setHasMore] = useState(true); // State to track if there’s more data
  const [selectedCrime, setSelectedCrime] = useState(null); // State for selected marker
  const [popupVisible, setPopupVisible] = useState(false); // State for popup visibility
  const popupRef = useRef(null); // Ref for the popup box

  // Fetch data from the API when component mounts or page changes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // Set loading to true when fetching starts
      try {
        // Request crime data from the API
        const response = await api.get("/api/crimes/", {
          params: { page: page }, // Pass the page number as a query parameter
        });

        // Set crime data from the API response
        setCrimeData(response.data.results);
        // Check if there's a next page of data
        setHasMore(response.data.next !== null);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
      setLoading(false); // Set loading to false once fetching completes
    };

    fetchData(); // Call the fetch function
  }, [page]); // Re-run effect when page changes

  // Go to the next page
  const goToNextPage = () => {
    if (hasMore) {
      setPage((prevPage) => prevPage + 1); // Increment page number
    }
  };

  // Go to the previous page
  const goToPreviousPage = () => {
    if (page > 1) {
      setPage((prevPage) => prevPage - 1); // Decrement page number
    }
  };

  // Handle marker click
  const handleMarkerClick = (crime) => {
    setSelectedCrime(crime); // Set selected crime data
    setPopupVisible(true); // Show the popup
  };

  // Close the popup
  const closePopup = () => {
    setPopupVisible(false); // Hide the popup
    setSelectedCrime(null); // Clear selected crime
  };

  // Handle outside click to close the popup
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        closePopup();
      }
    };

    if (popupVisible) {
      document.addEventListener("mousedown", handleOutsideClick);
    } else {
      document.removeEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [popupVisible]);

  return (
    <div>
      <Nav />
      <div className="map">
        <MapContainer
          center={[41.998469223, -87.670736531]}
          zoom={12}
          style={{ height: "80vh", width: "90%" }}
          onClick={closePopup} // Close the popup when clicking outside
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; <a href='http://osm.org/copyright'>OpenStreetMap</a> contributors"
          />
          {crimeData.map((crime, index) => (
            <Marker
              key={index}
              position={[crime.latitude, crime.longitude]}
              eventHandlers={{
                click: () => handleMarkerClick(crime), // Show popup on marker click
              }}
            >
              <Popup>
                <strong>Community Area:</strong> {crime.community_area || "N/A"}
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Popup for selected crime */}
        {popupVisible && selectedCrime && (
          <div className="crime-popup" ref={popupRef}>
            <div className="popup-content">
              <button className="close-button" onClick={closePopup}>
                X
              </button>
              <h2>Crime Details</h2>
              <p>
                <strong>Community Area:</strong> {selectedCrime.community_area || "N/A"}
              </p>
              <p>
                <strong>Date:</strong> {selectedCrime.date || "N/A"}
              </p>
              <p>
                <strong>Total Number of Crimes:</strong> {selectedCrime.Total_number_of_Crimes || "N/A"}
              </p>
              <p>
                <strong>Total Crime Rate:</strong> {selectedCrime.Total_crime_rate || "N/A"}
              </p>

              <h3>Crime Insights</h3>
              {selectedCrime.crimes_info && selectedCrime.crimes_info.length > 0 ? (
                <table className="crime-table">
                  <thead>
                    <tr>
                      <th>Primary Type</th>
                      <th>Crime Count</th>
                      <th>Crime Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedCrime.crimes_info.map((insight, index) => (
                      <tr key={index}>
                        <td>{insight["Primary Type"] || "N/A"}</td>
                        <td>{insight["Crime Count"] || "N/A"}</td>
                        <td>
                          {insight["Crime Rate"] ? insight["Crime Rate"].toFixed(4) : "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No insights available for this community area.</p>
              )}
            </div>
          </div>
        )}

        

        {loading && <p>Loading...</p>}
      </div>
      <div className="rate-buttons">
        <button onClick={goToPreviousPage} disabled={page <= 1}>
          Previous
        </button>
        <button onClick={goToNextPage} disabled={!hasMore}>
          Next
        </button>
      </div>
      <Footer />
    </div>
  );
};

export default CrimeMap;
