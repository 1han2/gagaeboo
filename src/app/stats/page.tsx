'use client';

import { useState, useEffect } from 'react';
import { getTransactions } from '@/lib/dataService';
import { Transaction } from '@/lib/types';
import StatsChart from '@/components/StatsChart';
import { format, subMonths, addMonths } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './page.module.css';

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

    return (
        <main className="container" style={{ paddingBottom: '5rem' }}>
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

            <div className={styles.filterContainer}>
                {['전체', '함께', '남편', '아내'].map(consumer => (
                    <button
                        key={consumer}
                        className={`${styles.filterBtn} ${selectedConsumer === consumer ? styles.activeFilter : ''}`}
                        onClick={() => setSelectedConsumer(consumer)}
                    >
                        {consumer}
                    </button>
                ))}
            </div>

            <div className="card">
                <div className={styles.totalContainer}>
                    <span className={styles.totalLabel}>{selectedConsumer} 총 {viewType === 'income' ? '수입' : '지출'}</span>
                    <span className={`${styles.totalAmount} ${viewType === 'income' ? styles.income : styles.expense}`}>
                        {totalAmount.toLocaleString()}원
                    </span>
                </div>

                <div className={styles.chartContainer}>
                    <StatsChart transactions={filteredTransactions} prevTransactions={filteredPrevTransactions} type={viewType} />
                </div>
            </div>
        </main>
    );
}
