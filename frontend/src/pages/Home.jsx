import Nav from "../components/Nav";
import "../styles/home.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { useEffect, useState } from "react";
import api from "../api";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import Img1 from "../assets/crime/IMG_5529.jpg";
import Img2 from "../assets/crime/h.jpg";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import Footer from "../components/footer";
import log from "../assets/crime/log.png";
import serIcon1 from "../assets/icons/service-item-icon1.png";
import serIcon2 from "../assets/icons/service-item-icon2.png";
import serIcon3 from "../assets/icons/service-item-icon3.png";
import { Link, useNavigate } from "react-router-dom";
export default function Home() {
  const navigate = useNavigate();
  // Example usage

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const fullName = `${firstName} ${lastName}`.trim();
  const [news, setNews] = useState([]); // Stores all news
  const [searchInput, setSearchInput] = useState(""); //
  const toggleSaveNews = async (newsId) => {
    try {
      const response = await api.post(`/api/add-history/${newsId}/`);
    } catch (error) {
      console.error("Error saving/unsaving news:", error);
    }
  };
  useEffect(() => {
    api
      .get("/api/notes/")
      .then((response) => {
        setNews(response.data); // Set the news data
      })
      .catch((error) => {
        console.error("Error fetching the news:", error);
      });
    // Fetch profile data

    // Fetch saved news

    // Fetch user profile data (first name and last name)
    api
      .get("/api/profile/")
      .then((response) => {
        setFirstName(response.data.first_name); // Assuming response includes first_name
        setLastName(response.data.last_name); // Assuming response includes last_name
      })
      .catch((error) => {
        console.error("Error fetching user profile:", error);
      });
  }, []);
  const handleSearchInput = (e) => {
    setSearchInput(e.target.value);
  };

  // Filter the news list based on search input
  const filteredNews = news.filter((item) =>
    item.title.toLowerCase().includes(searchInput.toLowerCase())
  );

  return (
    <div id="Home">
      <Nav />
      <div className="home-container">
        <div className="imageslides">
          <Swiper
            modules={[Autoplay, Pagination, Navigation]}
            spaceBetween={50}
            slidesPerView={1}
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            navigation
            loop={true}
            id="Main-swiper"
          >
            <SwiperSlide>
              <img src={Img1} className="imgslide" alt="" />
            </SwiperSlide>
            <SwiperSlide>
              <img src={Img2} alt="" className="imgslide" />
            </SwiperSlide>
          </Swiper>
        </div>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search for crimes rate..."
            className="search-input"
            value={searchInput}
            onChange={handleSearchInput}
          />
          <button
            className="search-history"
            onClick={() => navigate("/history")}
          >
            History Search
          </button>

          {/* Conditionally render the news list if search input exists */}
          {searchInput && (
            <div className="news-history-list">
              {filteredNews.map((item) => (
                <Link
                  key={item.id}
                  to={`/news/${item.id}`}
                  onClick={() => toggleSaveNews(item.id)}
                >
                  <div className="news-history-card">
                    <h3 className="news-history-title">{item.title}</h3>
                    <p className="news-history-content">
                      {item.body.length > 40
                        ? `${item.body.slice(0, 40)}...`
                        : item.body}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="welcome-view">
          <h1>Welcome,{fullName}</h1>
          <p>Your source for the latest crime data and analysis.</p>
        </div>

        <div className="sections">
          <img src={log} alt="log" />
          <div className="section_1">
            <h3>SAVED</h3>
            <hr />
            <p>
            The "Saved" feature allows users to collect and store news articles and content that interest them in one place.
            </p>
            <button onClick={() => navigate("/saved-news")}>VIEW </button>
          </div>
          <div className="section_2">
            <h3>HISTORY</h3>
            <hr />
            <p>
            The "Search History" feature keeps a record of the queries and searches users have conducted over time.
            </p>
            <button onClick={() => navigate("/history")}>VIEW </button>
          </div>
        </div>
        <div className="predict-section">
          <img
            src="https://sbtechnosoft.com/barrister/images/h1-line-img-white.png"
            alt="log"
          />
          <h2 className="section-title">How can I predict</h2>
          <div className="steps-container">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3 className="step-title">Crime Predict Page </h3>
              <p>
              Go to the crime rate prediction page at the top of the page in the bar 
              or through the site services or at the bottom of the site .
              </p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h3 className="step-title">Enter a Community Name </h3>
              <p>
              Search for the city you want to predict crimes in, 
              then click Search to see the results about the city.
              </p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h3 className="step-title">Click On The Map </h3>
              <p>
              A map will appear below, go to see it, you can see the location 
              where the crime occurred, click on the pin to see all the information
              </p>
            </div>
          </div>
        </div>
        <div className="service-section">
          <h2 className="ser-section-title">OUR SERVICE</h2>
          <div className="services-container">
            <div className="service-card">
              <h3>NEWS CRIME</h3>
              <p>
              The "NEWS CRIME" page offers extensive coverage of the latest crime news in Chicago, 
              featuring articles and reports on incidents and security issues to keep residents informed. 
              Users can save interesting stories for easy access later, helping them track important topics 
              and increasing community awareness of local risks and challenges.
              </p>
              <a href="/News" className="read-more">Show
              </a>
              <div className="service-icon">
                <img src={serIcon1} alt="Finance Icon" />
              </div>
            </div>

            <div className="service-card">
              <h3>CRIMES RATES</h3>
              <p>
              The "CRIME RATES" page provides detailed information on crime rates in various areas, 
              highlighting types of crimes and their percentages relative to overall rates. 
              This data helps residents understand security and identify high-risk areas. 
              It serves as a valuable resource for both researchers and citizens, fostering awareness and community engagement 
              in security issues.
              </p><a href="/rates" className="read-more">Show
              </a>
              <div className="service-icon">
                <img src={serIcon2} alt="Intellectual Property Icon" />
              </div>
            </div>

            <div className="service-card">
              <h3>PREDICT CRIMES</h3>
              <p>
              The "PREDICT CRIMES" page allows users to forecast crime rates in specific cities they plan to visit 
              and assess related risks. Utilizing extensively trained data, it offers insights into potential crime trends, 
              helping users make informed safety decisions before traveling. This proactive approach encourages awareness and
              precautionary measures while on the move.
              </p> <a href="/predict" className="read-more">Show</a>
              <div className="service-icon">
                <img src={serIcon3} alt="Merger Icon" />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}
