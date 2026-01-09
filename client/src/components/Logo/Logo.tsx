import { Link } from 'react-router-dom';
import styles from './Logo.module.scss';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
}

const Logo = ({ size = 'medium', showText = true }: LogoProps) => {
  return (
    <Link to="/" className={`${styles.logo} ${styles[size]}`}>
      <svg
        className={styles.icon}
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="20" height="20" rx="10" fill="currentColor" className={styles.iconBg} />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M7.40996 14C7.0721 14 6.90776 13.7295 6.97671 13.4461C7.06635 13.0596 7.53407 11.913 7.18242 11.3977C6.66528 10.6441 5.37876 10.7536 5.08917 10.3671C4.88044 10.0835 5.06645 9.80758 5.3552 9.64573C6.00335 9.25926 7.25827 9.36876 8.47871 8.6087C9.15444 8.19646 9.775 7.3591 10.1267 6.85668C10.6231 6.14815 10.8369 6 11.878 6H15.5247C16.099 6 16.2789 6.91015 15.3417 7.0102C15.1004 7.03597 14.4568 7.12614 13.5398 7.2292C12.6641 7.33226 10.7196 7.5781 11.485 8.74396C12.0573 9.35588 13.264 9.27858 13.5398 9.64573C13.7393 9.89987 13.5628 10.1702 13.3455 10.3001C12.6905 10.6865 11.2919 10.6441 10.0715 11.3977C9.24407 11.913 8.57122 13.0596 8.29541 13.4461C8.09546 13.7295 7.75472 14 7.41686 14H7.40996Z"
          className={styles.iconFg}
        />
      </svg>
      {showText && <span className={styles.text}>Fanvue</span>}
    </Link>
  );
};

export default Logo;
