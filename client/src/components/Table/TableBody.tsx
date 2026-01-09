import { useCallback } from 'react';
import styles from './Table.module.scss';
import type { Column } from './TableHeader';

interface TableBodyProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
}

function TableBody<T>({ 
  columns, 
  data, 
  keyExtractor, 
  onRowClick,
  emptyMessage = 'No data available'
}: TableBodyProps<T>) {
  const handleKeyDown = useCallback(
    (row: T) => (e: React.KeyboardEvent<HTMLTableRowElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onRowClick?.(row);
      }
    },
    [onRowClick]
  );

  if (data.length === 0) {
    return (
      <tbody className={styles.tableBody}>
        <tr role="row">
          <td 
            colSpan={columns.length} 
            className={styles.emptyState}
            role="cell"
          >
            {emptyMessage}
          </td>
        </tr>
      </tbody>
    );
  }

  return (
    <tbody className={styles.tableBody}>
      {data.map((row, rowIndex) => (
        <tr
          key={keyExtractor(row)}
          role="row"
          aria-rowindex={rowIndex + 2}
          onClick={() => onRowClick?.(row)}
          onKeyDown={onRowClick ? handleKeyDown(row) : undefined}
          className={onRowClick ? styles.clickable : ''}
          tabIndex={onRowClick ? 0 : undefined}
          aria-label={onRowClick ? 'Click to view details' : undefined}
        >
          {columns.map((column, colIndex) => {
            const value = column.key.toString().includes('.')
              ? column.key.toString().split('.').reduce((obj, key) => (obj as Record<string, unknown>)?.[key], row as unknown)
              : (row as Record<string, unknown>)[column.key as string];
            
            return (
              <td
                key={String(column.key)}
                role="cell"
                aria-colindex={colIndex + 1}
                style={{ textAlign: column.align || 'left' }}
              >
                {column.render ? column.render(value, row) : String(value ?? '-')}
              </td>
            );
          })}
        </tr>
      ))}
    </tbody>
  );
}

export default TableBody;
