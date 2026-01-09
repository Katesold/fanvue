import { useCallback, useRef, useId } from 'react';
import styles from './FilterPillGroup.module.scss';

export interface FilterOption<T extends string> {
  value: T;
  label: string;
  count?: number;
}

interface FilterPillGroupProps<T extends string> {
  options: FilterOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel?: string;
}

function FilterPillGroup<T extends string>({ 
  options, 
  value, 
  onChange,
  ariaLabel = 'Filter options'
}: FilterPillGroupProps<T>) {
  const groupRef = useRef<HTMLDivElement>(null);
  const groupId = useId();

  // Handle keyboard navigation (arrow keys)
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const buttons = groupRef.current?.querySelectorAll<HTMLButtonElement>('button');
    if (!buttons) return;

    let newIndex = index;

    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        newIndex = index < options.length - 1 ? index + 1 : 0;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        newIndex = index > 0 ? index - 1 : options.length - 1;
        break;
      case 'Home':
        e.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        newIndex = options.length - 1;
        break;
      default:
        return;
    }

    buttons[newIndex]?.focus();
    onChange(options[newIndex].value);
  }, [options, onChange]);

  return (
    <div 
      ref={groupRef}
      className={styles.filterGroup} 
      role="radiogroup" 
      aria-label={ariaLabel}
      id={groupId}
    >
      {options.map((option, index) => {
        const isSelected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            tabIndex={isSelected ? 0 : -1}
            className={`${styles.pill} ${isSelected ? styles.active : ''}`}
            onClick={() => onChange(option.value)}
            onKeyDown={(e) => handleKeyDown(e, index)}
          >
            <span className={styles.label}>{option.label}</span>
            {option.count !== undefined && (
              <span className={styles.count} aria-label={`${option.count} items`}>
                {option.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default FilterPillGroup;
