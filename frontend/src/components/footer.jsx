import logo from "../assets/crime/logo.png";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
  <footer className="footer-section">
      <div className="footer-container">
        <div className="footer-left">
          <h2 className="footer-title">
            <img src={logo} alt="logo" className="site-footer-logo" />
          </h2>
          <p className="footer-text">
            Welcome to our crime prediction site, where we provide valuable insights into crime rates and safety trends. 
            Stay informed about potential risks in your area and make safer choices when traveling. 
            Your security is our priority, and we’re here to help you navigate local crime data effectively.
          </p>
          <div className="social-icons">
           {/*  <a href="#">
              <i className="fab fa-facebook-f"></i>
            </a> */}
            <a href="https://twitter.com/AYNcoc" target="_blank">
               <i className="fab fa-twitter"></i>
            </a>
            {/* <a href="#">
              <i className="fab fa-linkedin-in"></i>
            </a>*/}
            <a href="mailto:ayncoc.qu@gmail.com" target="_blank">
               <i className="fas fa-envelope"></i>
            </a>
            <a href="https://www.youtube.com/@AYN-coc" target="_blank">
               <i className="fab fa-youtube"></i>
            </a>
          </div>
        </div>

        <div className="footer-middle">
          <h4>ADDITIONAL RESEARCH LINKS</h4>
          <ul>
            <Link to={"/profile"}>
              <li>MY PROFILE</li>
            </Link>{" "}
            <Link to={"/news"}>
              <li>CHECK NEWS</li>
            </Link>{" "}
            <Link to={"/saved-news"}>
              <li>YOUR SAVES</li>
            </Link>{" "}
            <Link to={"/rates"}>
              <li>CRIMES RATES</li>
            </Link>{" "}
            <Link to={"/history"}>
              <li>HISTORY</li>
            </Link>{" "}
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; Copyright 2018, AYN | All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
