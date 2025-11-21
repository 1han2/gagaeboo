'use client';

import { useState, useEffect } from 'react';
import { getTransactions } from '@/lib/dataService';
import { Transaction } from '@/lib/types';
import StatsChart from '@/components/StatsChart';
import Skeleton from '@/components/Skeleton';
import { format, subMonths, addMonths } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './page.module.css';
import { USER_LABELS } from '@/lib/config';

export default function StatsPage() {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [prevTransactions, setPrevTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewType, setViewType] = useState<'expense' | 'income'>('expense');
    const [selectedConsumer, setSelectedConsumer] = useState('전체');

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            const monthStr = format(currentMonth, 'yyyy-MM');
            const prevMonthStr = format(subMonths(currentMonth, 1), 'yyyy-MM');

            const [currentData, prevData] = await Promise.all([
                getTransactions(monthStr),
                getTransactions(prevMonthStr)
            ]);

            setTransactions(currentData);
            setPrevTransactions(prevData);
            setLoading(false);
        };
        loadData();
    }, [currentMonth]);

    const filteredTransactions = selectedConsumer === '전체'
        ? transactions
        : transactions.filter(t => t.consumer === selectedConsumer);

    const filteredPrevTransactions = selectedConsumer === '전체'
        ? prevTransactions
        : prevTransactions.filter(t => t.consumer === selectedConsumer);

    const totalAmount = filteredTransactions
        .filter(t => t.type === viewType)
        .reduce((sum, t) => sum + t.amount, 0);

    const prevTotalAmount = filteredPrevTransactions
        .filter(t => t.type === viewType)
        .reduce((sum, t) => sum + t.amount, 0);

    const percentageChange = prevTotalAmount > 0
        ? ((totalAmount - prevTotalAmount) / prevTotalAmount * 100).toFixed(1)
        : 0;

    return (
        <main style={{ paddingBottom: '5rem' }}>
            <div className="container" style={{ paddingBottom: 0 }}>
                <div className={styles.header}>
                    <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className={styles.navBtn}>
                        <ChevronLeft size={24} />
                    </button>
                    <h2 className={styles.monthTitle}>{format(currentMonth, 'yyyy년 M월')}</h2>
                    <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className={styles.navBtn}>
                        <ChevronRight size={24} />
                    </button>
                </div>

                <div className={styles.toggleContainer}>
                    <button
                        className={`${styles.toggleBtn} ${viewType === 'expense' ? styles.active : ''}`}
                        onClick={() => setViewType('expense')}
                    >
                        지출
                    </button>
                    <button
                        className={`${styles.toggleBtn} ${viewType === 'income' ? styles.active : ''}`}
                        onClick={() => setViewType('income')}
                    >
                        수입
                    </button>
                </div>


            </div>

            <div style={{ backgroundColor: 'white', width: '100%', padding: '1.5rem 1rem', minHeight: '50vh' }}>
                <div className="container" style={{ paddingBottom: 0 }}>
                    <div className={styles.filterContainer}>
                        {['전체', '함께', USER_LABELS.person1, USER_LABELS.person2].map(consumer => (
                            <button
                                key={consumer}
                                className={`${styles.filterBtn} ${selectedConsumer === consumer ? styles.activeFilter : ''}`}
                                onClick={() => setSelectedConsumer(consumer)}
                            >
                                {consumer}
                            </button>
                        ))}
                    </div>
                </div>
                {loading ? (
                    <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: 0 }}>
                        <Skeleton style={{ width: '40%', height: '18px' }} />
                        <Skeleton style={{ width: '60%', height: '36px' }} />
                        <Skeleton style={{ width: '100%', height: '260px' }} />
                    </div>
                ) : (
                    <div className="container" style={{ paddingBottom: 0 }}>
                        <div className={styles.totalContainer} style={{ backgroundColor: 'transparent', padding: '0 0 1.5rem 0' }}>
                            <span className={styles.totalLabel}>{selectedConsumer} 총 {viewType === 'income' ? '수입' : '지출'}</span>
                            <span className={`${styles.totalAmount} ${viewType === 'income' ? styles.income : styles.expense}`}>
                                {totalAmount.toLocaleString()}원
                            </span>
                            {prevTotalAmount > 0 && (
                                <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                    <span>지난달: {prevTotalAmount.toLocaleString()}원</span>
                                    <span style={{
                                        marginLeft: '0.5rem',
                                        color: Number(percentageChange) > 0 ? 'var(--danger)' : 'var(--success)',
                                        fontWeight: 600
                                    }}>
                                        {Number(percentageChange) > 0 ? '▲' : '▼'} {Math.abs(Number(percentageChange))}%
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className={styles.chartContainer}>
                            <StatsChart transactions={filteredTransactions} prevTransactions={filteredPrevTransactions} type={viewType} />
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
