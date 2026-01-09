import { useId } from 'react';
import styles from './Table.module.scss';
import TableHeader, { type Column } from './TableHeader';
import TableBody from './TableBody';

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  onRowClick?: (row: T) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  caption?: string;
  ariaLabel?: string;
}

function Table<T>({ 
  columns, 
  data, 
  keyExtractor, 
  onRowClick,
  isLoading = false,
  emptyMessage = 'No data available',
  caption,
  ariaLabel = 'Data table',
}: TableProps<T>) {
  const tableId = useId();
  const captionId = `${tableId}-caption`;

  if (isLoading) {
    return (
      <div 
        className={styles.loadingState}
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <div className={styles.spinner} aria-hidden="true" />
        <span>Loading data...</span>
      </div>
    );
  }

  return (
    <div 
      className={styles.tableContainer}
      role="region"
      aria-label={ariaLabel}
      tabIndex={0}
    >
      <table 
        className={styles.table}
        aria-labelledby={caption ? captionId : undefined}
        aria-rowcount={data.length}
      >
        {caption && (
          <caption id={captionId} className={styles.caption}>
            {caption}
          </caption>
        )}
        <TableHeader columns={columns} />
        <TableBody 
          columns={columns} 
          data={data} 
          keyExtractor={keyExtractor}
          onRowClick={onRowClick}
          emptyMessage={emptyMessage}
        />
      </table>
    </div>
  );
}

export default Table;
