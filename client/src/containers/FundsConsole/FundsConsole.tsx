import { useState, useDeferredValue, useMemo, useCallback, useId } from 'react';
import { usePersistentState, usePayouts, useSnapshot } from '../../hooks';
import { formatCurrency, formatDate, formatPaymentMethod } from '../../utils/formatters';
import { getStatusAriaLabel, getRiskScoreAriaLabel } from '../../utils/accessibility';
import StatCard from '../../components/StatCard';
import FilterPillGroup, { type FilterOption } from '../../components/FilterPillGroup';
import Table, { type Column } from '../../components/Table';
import StatusBadge from '../../components/StatusBadge';
import RiskScore from '../../components/RiskScore';
import PayoutDetailPanel from '../../components/PayoutDetailPanel';
import { DollarIcon, ClockIcon, FlagIcon } from '../../components/Icons';
import type { Payout, FilterStatus } from '../../types';
import styles from './FundsConsole.module.scss';

// Filter options - defined outside component to prevent recreation
const FILTER_OPTIONS: readonly FilterOption<FilterStatus>[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'flagged', label: 'Flagged' },
  { value: 'paid', label: 'Paid' },
] as const;

const FundsConsole = () => {
  const regionId = useId();
  const [filter, setFilter] = usePersistentState<FilterStatus>('fundsConsoleFilter', 'all');
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);

  // Use custom hooks for data fetching
  const { 
    data: snapshot, 
    isLoading: isSnapshotLoading,
    error: snapshotError,
    isFetching: isSnapshotFetching,
  } = useSnapshot();

  const { 
    data: payouts, 
    isLoading: isPayoutsLoading,
    error: payoutsError,
    isFetching: isPayoutsFetching,
  } = usePayouts(filter);

  // Use deferred value to prevent UI blocking during heavy re-renders
  const deferredPayouts = useDeferredValue(payouts);
  const isStale = deferredPayouts !== payouts;

  // Memoized columns definition
  const columns: Column<Payout>[] = useMemo(() => [
    {
      key: 'creatorId',
      header: 'Creator',
      ariaLabel: 'Creator ID',
      render: (value) => (
        <span className={styles.creatorId}>{String(value)}</span>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      ariaLabel: 'Amount and Currency',
      align: 'right',
      render: (_, row) => (
        <span className={styles.amount} aria-label={`${row.amount} ${row.currency}`}>
          {formatCurrency(row.amount, row.currency)}
        </span>
      ),
    },
    {
      key: 'method',
      header: 'Method',
      ariaLabel: 'Payment Method',
      render: (value) => formatPaymentMethod(String(value)),
    },
    {
      key: 'scheduledFor',
      header: 'Scheduled',
      ariaLabel: 'Scheduled Date',
      render: (value) => (
        <time dateTime={String(value)}>
          {formatDate(String(value))}
        </time>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      ariaLabel: 'Payout Status',
      render: (value, row) => (
        <span aria-label={getStatusAriaLabel(row.status)}>
          <StatusBadge status={value as Payout['status']} />
        </span>
      ),
    },
    {
      key: 'riskScore',
      header: 'Risk',
      ariaLabel: 'Risk Score',
      width: '140px',
      render: (value, row) => (
        <span aria-label={getRiskScoreAriaLabel(row.riskScore)}>
          <RiskScore score={Number(value)} />
        </span>
      ),
    },
  ], []);

  // Memoized row click handler
  const handleRowClick = useCallback((payout: Payout) => {
    setSelectedPayout(payout);
  }, []);

  // Close detail panel handler
  const handleCloseDetail = useCallback(() => {
    setSelectedPayout(null);
  }, []);

  // Memoized filter change handler
  const handleFilterChange = useCallback((newFilter: FilterStatus) => {
    setFilter(newFilter);
  }, [setFilter]);

  // Error state
  if (snapshotError || payoutsError) {
    return (
      <div 
        className={styles.error}
        role="alert"
        aria-live="assertive"
      >
        <h2>Error loading data</h2>
        <p>{(snapshotError as Error)?.message || (payoutsError as Error)?.message}</p>
        <button 
          onClick={() => window.location.reload()}
          className={styles.retryButton}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <article 
      className={styles.fundsConsole}
      aria-labelledby={`${regionId}-title`}
    >
      <h1 id={`${regionId}-title`} className={styles.visuallyHidden}>
        Funds Console Dashboard
      </h1>

      {/* Stats Header - Accessible landmark */}
      <section 
        className={styles.statsSection}
        aria-label="Financial Summary"
        role="region"
      >
        <h2 className={styles.visuallyHidden}>Today's Financial Summary</h2>
        <StatCard
          label="Total Scheduled Today"
          value={snapshot ? formatCurrency(snapshot.totalScheduledToday, snapshot.currency) : '—'}
          variant="success"
          isLoading={isSnapshotLoading || isSnapshotFetching}
          icon={<DollarIcon />}
        />
        <StatCard
          label="Held Amount"
          value={snapshot ? formatCurrency(snapshot.heldAmount, snapshot.currency) : '—'}
          variant="warning"
          isLoading={isSnapshotLoading || isSnapshotFetching}
          icon={<ClockIcon />}
        />
        <StatCard
          label="Flagged Amount"
          value={snapshot ? formatCurrency(snapshot.flaggedAmount, snapshot.currency) : '—'}
          variant="danger"
          isLoading={isSnapshotLoading || isSnapshotFetching}
          icon={<FlagIcon />}
        />
      </section>

      {/* Filter Section */}
      <section 
        className={styles.filterSection}
        aria-label="Payout Filters"
        role="region"
      >
        <h2 className={styles.sectionTitle} id={`${regionId}-payouts`}>
          Payouts
          {isPayoutsFetching && !isPayoutsLoading && (
            <span className={styles.refreshIndicator} aria-label="Refreshing data">
              <span className={styles.dot} />
            </span>
          )}
        </h2>
        <FilterPillGroup
          options={[...FILTER_OPTIONS]}
          value={filter}
          onChange={handleFilterChange}
        />
      </section>

      {/* Payouts Table - with deferred value for performance */}
      <section 
        className={`${styles.tableSection} ${isStale ? styles.stale : ''}`}
        aria-label="Payouts List"
        role="region"
        aria-busy={isPayoutsLoading}
      >
        <Table
          columns={columns}
          data={deferredPayouts || []}
          keyExtractor={(payout) => payout.id}
          onRowClick={handleRowClick}
          isLoading={isPayoutsLoading}
          emptyMessage="No payouts found for the selected filter"
          caption={`Payouts - ${filter === 'all' ? 'All' : filter} status`}
          ariaLabel="Payouts data table"
        />
      </section>

      {/* Payout Detail Panel */}
      {selectedPayout && (
        <PayoutDetailPanel
          payout={selectedPayout}
          onClose={handleCloseDetail}
        />
      )}
    </article>
  );
};

export default FundsConsole;
