import Logo from "../Logo";
import Navbar from "../Navbar/Navbar";
import ThemeToggle from "../ThemeToggle/ThemeToggle";
import styles from "./Header.module.scss";

const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.left}>
          <Logo size="medium" />
          <span className={styles.subtitle}>Funds Console</span>
        </div>
        <div className={styles.right}>
          <Navbar />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;
