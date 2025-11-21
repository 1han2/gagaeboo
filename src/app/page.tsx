'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Calendar from '@/components/Calendar';
import TransactionList from '@/components/TransactionList';
import Skeleton from '@/components/Skeleton';
import { getTransactions } from '@/lib/dataService';
import { Transaction } from '@/lib/types';
import { format } from 'date-fns';

import styles from './page.module.css';

export default function Home() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(() => {
    const dateParam = searchParams.get('date');
    return dateParam ? new Date(dateParam) : new Date();
  });
  const [currentMonth, setCurrentMonth] = useState(() => {
    const dateParam = searchParams.get('date');
    return dateParam ? new Date(dateParam) : new Date();
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const monthStr = format(currentMonth, 'yyyy-MM');
      const data = await getTransactions(monthStr);
      setTransactions(data);
      setLoading(false);
    };
    loadData();
  }, [currentMonth]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    const dateStr = format(date, 'yyyy-MM-dd');
    router.replace(`/?date=${dateStr}`, { scroll: false });
  };

  const totalMonthlyExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <main className={`container ${styles.mainContainer}`}>
      <div
        style={{
          marginBottom: '1rem',
          padding: '0.75rem 1rem',
          background: 'var(--primary)',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderRadius: '1rem',
          minHeight: '60px',
        }}
      >
        <>
          <span style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.9)', fontWeight: 600 }}>
            {format(currentMonth, 'M월')} 총 지출
          </span>
          {loading ? (
            <Skeleton style={{ width: '40%', height: '28px', borderRadius: '999px' }} />
          ) : (
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>
              {totalMonthlyExpense.toLocaleString()}원
            </span>
          )}
        </>
      </div>

      <div className={`desktop-layout ${styles.desktopLayout}`}>
        <div className={`desktop-left ${styles.desktopLeft}`}>
          <Calendar
            transactions={transactions}
            onDateSelect={handleDateSelect}
            selectedDate={selectedDate}
            currentMonth={currentMonth}
            onMonthChange={setCurrentMonth}
            isLoading={loading}
          />
        </div>
        <div className={`desktop-right ${styles.desktopRight}`}>
          {loading ? (
            <div className="card" style={{ minHeight: '400px' }}>
              <Skeleton style={{ width: '60%', height: '22px', marginBottom: '1rem' }} />
              {[...Array(5)].map((_, idx) => (
                <Skeleton key={idx} style={{ width: '100%', height: '60px', marginBottom: '0.75rem' }} />
              ))}
            </div>
          ) : (
            <TransactionList date={selectedDate} transactions={transactions} />
          )}
        </div>
      </div>
    </main>
  );
}
