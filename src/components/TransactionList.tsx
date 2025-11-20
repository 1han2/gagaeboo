'use client';

import { Transaction } from '@/lib/types';
import styles from './TransactionList.module.css';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

import Link from 'next/link';
import { Plus } from 'lucide-react';

interface TransactionListProps {
    date: Date;
    transactions: Transaction[];
}

export default function TransactionList({ date, transactions }: TransactionListProps) {
    const dailyTransactions = transactions.filter(t => t.date === format(date, 'yyyy-MM-dd'));

    const totalIncome = dailyTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = dailyTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <h3 className={styles.dateTitle}>{format(date, 'M월 d일 (eee)', { locale: ko })}</h3>
                    <div className={styles.summary}>
                        {totalIncome > 0 && <span className={styles.income}>+{totalIncome.toLocaleString()}</span>}
                        {totalExpense > 0 && <span className={styles.expense}>-{totalExpense.toLocaleString()}</span>}
                    </div>
                </div>
                <Link href={`/add?date=${format(date, 'yyyy-MM-dd')}`} className={styles.addBtnHeader}>
                    <Plus size={20} />
                </Link>
            </div>

            {dailyTransactions.length === 0 ? (
                <div className={styles.empty}>내역이 없습니다</div>
            ) : (
                <div className={styles.list}>
                    {dailyTransactions.map(t => (
                        <Link key={t.id} href={`/add?id=${t.id}&date=${t.date}`} className={styles.itemLink}>
                            <div className={styles.item}>
                                <div className={styles.itemLeft}>
                                    <span className={styles.category}>{t.category}</span>
                                    <span className={styles.merchant}>{t.merchant}</span>
                                </div>
                                <div className={styles.itemRight}>
                                    <span className={t.type === 'income' ? styles.income : styles.expense}>
                                        {t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString()}
                                    </span>
                                    <span className={styles.consumer}>{t.consumer}</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
