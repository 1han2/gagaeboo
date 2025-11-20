'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Calendar from '@/components/Calendar';
import TransactionList from '@/components/TransactionList';
import { getTransactions } from '@/lib/dataService';
import { Transaction } from '@/lib/types';
import { format } from 'date-fns';

export default function Home() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(() => {
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
    <main className="container" style={{ paddingBottom: '5rem' }}>
      <div style={{
        marginBottom: '1rem',
        padding: '1rem',
        background: 'var(--primary)',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: 'var(--radius)',
      }}>
        <span style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.9)', fontWeight: 600 }}>이번 달 총 지출</span>
        <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>
          {totalMonthlyExpense.toLocaleString()}원
        </span>
      </div>

      <div className="desktop-layout">
        <div className="desktop-left">
          <Calendar
            transactions={transactions}
            onDateSelect={handleDateSelect}
            selectedDate={selectedDate}
            currentMonth={currentMonth}
            onMonthChange={setCurrentMonth}
          />
        </div>
        <div className="desktop-right">
          <TransactionList date={selectedDate} transactions={transactions} />
        </div>
      </div>
    </main>
  );
}
