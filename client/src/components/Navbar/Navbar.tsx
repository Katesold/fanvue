import { NavLink } from "react-router-dom";
import styles from "./Navbar.module.scss";

const Navbar = () => {
  return (
    <nav className={styles.nav}>
      <NavLink
        to="/"
        className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ""}`}
      >
        Dashboard
      </NavLink>
      <NavLink
        to="/about"
        className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ""}`}
      >
        About
      </NavLink>
    </nav>
  );
};

export default Navbar;
