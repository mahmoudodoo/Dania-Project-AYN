import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import { useNavigate } from "react-router-dom";
import Img1 from "../assets/crime/ba.jpg";
import Img2 from "../assets/crime/bb.png";
// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
const Main = () => {
  const navigat = useNavigate();
  function login() {
    navigat("/login");
  }
  function register() {
    navigat("/register");
  }
  return (
    <div id="Main">
      {" "}
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        spaceBetween={50}
        slidesPerView={1}
        autoplay={{ delay: 10000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        navigation
        loop={true}
        id="Main-swiper"
      >
        <SwiperSlide className="slide">
          <div>
            <img className="image-slide" src={Img1} alt="slideimg" />
            <h1> Hello to our page</h1>
            <p>here everything you need</p>
            <div className="main-buttons">
              <button className="main-button" onClick={login}>
                {" "}
                Login
              </button>
              <button className="main-button" onClick={register}>
                {" "}
                Register
              </button>
            </div>
          </div>
        </SwiperSlide>
        <SwiperSlide className="slide">
          <div>
            <img className="image-slide" src={Img2} alt="slideimg" />
            <h1> Hello to our page</h1>
            <p>here everything you need</p>
            <div className="main-buttons">
              <button className="main-button" onClick={login}>
                {" "}
                Login
              </button>
              <button className="main-button" onClick={register}>
                {" "}
                Register
              </button>
            </div>
          </div>
        </SwiperSlide>

        {/* Add more slides as needed */}
      </Swiper>
    </div>
  );
};

export default Main;
