import { useMemo } from 'react';
import styles from './RiskScore.module.scss';

interface RiskScoreProps {
  score: number;
  showLabel?: boolean;
}

// Risk level configuration
interface RiskLevel {
  label: string;
  variant: string;
  description: string;
}

const getRiskLevel = (score: number): RiskLevel => {
  if (score <= 25) return { label: 'Low', variant: 'low', description: 'Low risk - no concerns' };
  if (score <= 50) return { label: 'Medium', variant: 'medium', description: 'Medium risk - monitor closely' };
  if (score <= 75) return { label: 'High', variant: 'high', description: 'High risk - requires attention' };
  return { label: 'Critical', variant: 'critical', description: 'Critical risk - immediate action needed' };
};

const RiskScore = ({ score, showLabel = true }: RiskScoreProps) => {
  const { label, variant, description } = useMemo(() => getRiskLevel(score), [score]);
  const clampedScore = Math.min(100, Math.max(0, score));
  
  return (
    <div 
      className={`${styles.riskScore} ${styles[variant]}`}
      role="meter"
      aria-valuenow={clampedScore}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Risk score: ${clampedScore} out of 100, ${label} risk`}
      title={description}
    >
      <div className={styles.bar} aria-hidden="true">
        <div 
          className={styles.fill} 
          style={{ width: `${clampedScore}%` }} 
        />
      </div>
      {showLabel && (
        <span className={styles.label}>
          <span className={styles.score}>{clampedScore}</span>
          <span className={styles.separator}>-</span>
          <span className={styles.levelText}>{label}</span>
        </span>
      )}
    </div>
  );
};

export default RiskScore;
