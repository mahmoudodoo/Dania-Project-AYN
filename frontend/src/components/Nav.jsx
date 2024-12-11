import { FaRegUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Logo from "../assets/crime/logo.png";

export default function Nav() {
  const navigate = useNavigate();
  const [menuActive, setMenuActive] = useState(false);

  const path = window.location.pathname;

  function clicked() {
    navigate("/profile");
  }
  function clicked1() {
    navigate("/home");
  }
  function clicked2() {
    navigate("/news");
  }
  function clicked3() {
    navigate("/rates");
  }
  function clicked4() {
    navigate("/predict");
  }

  const toggleMenu = () => {
    setMenuActive(!menuActive); // Toggle the mobile menu
  };

  return (
    <nav className="navbar">
      <img src={Logo} alt="logo" className="site-logo" />

      <ul className={`navbar-list ${menuActive ? "active" : ""}`}>
        <li className={path === "/home" ? "active" : null} onClick={clicked1}>
          Home
        </li>
        <li className={path === "/news" ? "active" : null} onClick={clicked2}>
          News Crimes
        </li>
        <li className={path === "/rates" ? "active" : null} onClick={clicked3}>
          Crime Rates
        </li>
        <li
          className={path === "/predict" ? "active" : null}
          onClick={clicked4}
        >
          Crime Predict
        </li>
        <li
          id="profileicon"
          className={path === "/profile" ? "active" : null}
          onClick={clicked}
        >
          <FaRegUserCircle />
        </li>
      </ul>

      {/* Hamburger Icon for Mobile */}
      <div className="hamburger" onClick={toggleMenu}>
        &#9776;
      </div>
    </nav>
  );
}
