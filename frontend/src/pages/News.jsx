import { useEffect, useState } from "react";
import Nav from "../components/Nav";
import "../styles/news.css";
import "swiper/css";
import { Link } from "react-router-dom";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Pagination, Navigation } from "swiper/modules";
import Footer from "../components/footer";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import api from "../api";

// Fix for Leaflet icon issues with Webpack
import L from "leaflet";
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const News = () => {
  const [news, setNews] = useState([]);
  const [savedNewsIds, setSavedNewsIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); // Current page for pagination
  const [totalPages, setTotalPages] = useState(1); // Total pages
  const itemsPerPage = 20; // Number of items per page
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch the total count of records
    axios
      .get(`/api/news?$select=count(*)`) // Replace with your API's count mechanism if available
      .then((response) => {
        const totalRecords = response.data[0].count; // Adjust based on your API's response structure
        setTotalPages(Math.ceil(totalRecords / itemsPerPage));
      })
      .catch((error) => {
        console.error("Error fetching the total count:", error);
      });
  }, []);

  useEffect(() => {
    // Fetch news with pagination
    axios
      .get(`/api/news?$limit=${itemsPerPage}&$offset=${(currentPage - 1) * itemsPerPage}`)
      .then((response) => {
        setNews(response.data);
      })
      .catch((error) => {
        console.error("Error fetching the news:", error);
      });

    // Fetch saved news
    api
      .get("/api/saved-news/")
      .then((response) => {
        const savedIds = response.data.saved_news.map((newsItem) => newsItem.id);
        setSavedNewsIds(savedIds);
      })
      .catch((error) => {
        console.error("Error fetching saved news:", error);
      });
  }, [currentPage]); // Refetch data when the current page changes

  const toggleSaveNews = async (newsData) => {
    try {
      const response = await api.post(`/api/save-news/`, {
        title: newsData.primary_type,
        body: newsData.description || "No description available",
        updated: newsData.updated_on,
        created: newsData.date,
      });

      const message = response.data.message;
      if (message.includes("removed")) {
        setSavedNewsIds((prevSavedNewsIds) =>
          prevSavedNewsIds.filter((id) => id !== newsData.id)
        );
      } else {
        setSavedNewsIds((prevSavedNewsIds) => [...prevSavedNewsIds, newsData.id]);
      }
    } catch (error) {
      console.error("Error saving/unsaving news:", error);
    }
  };

  const truncateText = (text, maxWords) => {
    const words = text.split(" ");
    return words.length > maxWords
      ? words.slice(0, maxWords).join(" ") + "..."
      : text;
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  return (
    <div id="News">
      <Nav />
      <div className="news-container">
        <button onClick={() => navigate("/saved-news")}>View Saved News</button>
        <Swiper
          effect={"coverflow"}
          grabCursor={true}
          centeredSlides={true}
          slidesPerView={3}
          coverflowEffect={{
            rotate: 2,
            stretch: 0,
            depth: 100,
            modifier: 5,
          }}
          modules={[EffectCoverflow, Pagination, Navigation]}
          className="swiper_container"
        >
          {news.map((item) => (
            <SwiperSlide id={item.id} key={item.id}>
              <div className="card">
                <Link to={`/news/${item.id}`}>
                  <h2 className="note-title">Title: {item.primary_type}</h2>
                  <h2 className="note-title">
                    Date: {new Date(item.date).toLocaleDateString()}
                  </h2>
                  <div className="news-map">
                    <MapContainer
                      center={[item.latitude || 41.8781, item.longitude || -87.6298]}
                      zoom={13}
                      style={{ height: "200px", width: "100%" }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <Marker
                        position={[
                          item.latitude || 41.8781,
                          item.longitude || -87.6298,
                        ]}
                      >
                        <Popup>
                          {item.location_description || "No location available"}
                        </Popup>
                      </Marker>
                    </MapContainer>
                  </div>
                  <div className="card-p">
                    <p>
                      {truncateText(
                        `Description: ${
                          item.description || "No description available"
                        }\nLocation: ${
                          item.location_description || "Unknown"
                        }\nArrest: ${
                          item.arrest ? "Yes" : "No"
                        }\nPrimary Type: ${
                          item.primary_type || "N/A"
                        }\nCommunity Area: ${item.community_area || "N/A"}`,
                        40
                      )}
                    </p>
                  </div>
                </Link>
                <button
                  className="card-but"
                  onClick={() => toggleSaveNews(item)}
                  style={{
                    backgroundColor: savedNewsIds.includes(item.id) ? "green" : "blue",
                    color: "white",
                  }}
                >
                  {savedNewsIds.includes(item.id) ? "Unsave" : "Save"}
                </button>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        <div className="pagination-controls">
          <button onClick={handlePreviousPage} disabled={currentPage === 1}>
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button onClick={handleNextPage} disabled={currentPage === totalPages}>
            Next
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default News;
