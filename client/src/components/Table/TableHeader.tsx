import styles from './Table.module.scss';

export interface Column<T> {
  key: keyof T | string;
  header: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: unknown, row: T) => React.ReactNode;
  ariaLabel?: string;
  sortable?: boolean;
}

interface TableHeaderProps<T> {
  columns: Column<T>[];
}

function TableHeader<T>({ columns }: TableHeaderProps<T>) {
  return (
    <thead className={styles.tableHeader}>
      <tr role="row">
        {columns.map((column, index) => (
          <th
            key={String(column.key)}
            scope="col"
            role="columnheader"
            aria-colindex={index + 1}
            aria-label={column.ariaLabel || column.header}
            style={{ 
              width: column.width,
              textAlign: column.align || 'left'
            }}
          >
            {column.header}
          </th>
        ))}
      </tr>
    </thead>
  );
}

export default TableHeader;
