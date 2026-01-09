import { Link } from "react-router-dom";
import Logo from "../Logo";
import styles from "./Footer.module.scss";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.brand}>
          <Logo size="small" />
          <p className={styles.description}>
            Unified dashboard for payment operations
          </p>
        </div>

        <div className={styles.links}>
          <div className={styles.linkGroup}>
            <h4 className={styles.linkTitle}>Navigation</h4>
            <Link to="/">Dashboard</Link>
            <Link to="/about">About</Link>
          </div>

          <div className={styles.linkGroup}>
            <h4 className={styles.linkTitle}>Resources</h4>
            <Link to="/sitemap">Sitemap</Link>
            <a href="#" onClick={(e) => e.preventDefault()}>Documentation</a>
          </div>
        </div>

        <div className={styles.copyright}>
          <p>© {currentYear} Fanvue. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
