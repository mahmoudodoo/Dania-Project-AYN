//import { ACCESS_TOKEN } from "../constants";
import { useState, useEffect } from "react";
import api from "../api";
import Nav from "../components/Nav";
import "../styles/news.css";
import photo from "./News/jhon.jpg";
import "swiper/css";
import { Link } from "react-router-dom";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Pagination, Navigation } from "swiper/modules";
import Footer from "../components/footer";
import { useNavigate } from "react-router-dom";
const SavedNews = () => {
  const [news, setNews] = useState([]);

  useEffect(() => {
    api
      .get("/api/saved-news/")
      .then((response) => {
        console.log("Response data:", response.data); // Debugging log
        // Ensure the response contains saved_news and it's an array
        if (Array.isArray(response.data.saved_news)) {
          setNews(response.data.saved_news); // Set only the saved_news array
        } else {
          console.error("Saved news is not an array");
          setNews([]); // Set an empty array as fallback
        }
      })
      .catch((error) => {
        console.error("Error fetching the news:", error);
        setNews([]); // Set an empty array in case of error
      });
  }, []); // Empty dependency array ensures this runs only once
  console.log(news);
  // Conditional rendering based on loading, error, or saved news state
  const navigate = useNavigate();
  const truncateText = (text, maxWords) => {
    const words = text.split(" ");
    return words.length > maxWords
      ? words.slice(0, maxWords).join(" ") + "..."
      : text;
  };
  return (
    <div id="Saved-News">
      <Nav />
      <div className="saved-container">
        <h1>Saved News</h1>
        <button onClick={() => navigate("/news")}>News</button>
        <Swiper
          effect={"coverflow"}
          grabCursor={true}
          centeredSlides={true}
          loop={false}
          slidesPerView={3}
          coverflowEffect={{
            rotate: 2,
            stretch: 0,
            depth: 100,
            modifier: 6,
          }}
          pagination={{ el: ".swiper-pagination", clickable: true }}
          navigation={{
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
            clickable: true,
          }}
          modules={[EffectCoverflow, Pagination, Navigation]}
          className="swiper_container"
        >
          {news.map((item) => (
            <SwiperSlide id={item.id} key={item.id}>
              <div className="card">
                <Link to={`/news/${item.id}`}>
                  <h2 className="note-title">Title: {item.title}</h2>
                  <h2 className="note-title">
                    Date: {new Date(item.created).toLocaleDateString()}
                  </h2>
                  <img className="news-image" src={photo} alt={item.title} />
                  <div className="card-p">
                    <p>{truncateText(item.body, 40)}</p>{" "}
                    {/* Limit to 40 words */}
                  </div>
                </Link>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      <Footer />
    </div>
  );
};

export default SavedNews;
