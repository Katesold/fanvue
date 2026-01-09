import { useId } from 'react';
import styles from './StatCard.module.scss';

export interface StatCardProps {
  label: string;
  value: string | number;
  variant?: 'default' | 'warning' | 'danger' | 'success';
  icon?: React.ReactNode;
  isLoading?: boolean;
  onClick?: () => void;
}

const StatCard = ({ 
  label, 
  value, 
  variant = 'default', 
  icon,
  isLoading = false,
  onClick,
}: StatCardProps) => {
  const labelId = useId();
  const valueId = useId();

  const content = (
    <>
      {icon && (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      )}
      <div className={styles.content}>
        <span className={styles.label} id={labelId}>
          {label}
        </span>
        <span 
          className={styles.value} 
          id={valueId}
          aria-live={isLoading ? 'polite' : undefined}
          aria-busy={isLoading}
        >
          {isLoading ? (
            <span className={styles.loading} aria-label="Loading">
              <span className={styles.loadingDot} />
              <span className={styles.loadingDot} />
              <span className={styles.loadingDot} />
            </span>
          ) : (
            value
          )}
        </span>
      </div>
    </>
  );

  // Render as button if clickable, otherwise as article
  if (onClick) {
    return (
      <button 
        className={`${styles.statCard} ${styles[variant]} ${styles.clickable}`}
        type="button"
        onClick={onClick}
        disabled={isLoading}
        aria-labelledby={labelId}
        aria-describedby={valueId}
      >
        {content}
      </button>
    );
  }

  return (
    <article 
      className={`${styles.statCard} ${styles[variant]}`}
      aria-labelledby={labelId}
      aria-describedby={valueId}
    >
      {content}
    </article>
  );
};

export default StatCard;
