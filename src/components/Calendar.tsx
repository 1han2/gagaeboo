'use client';


import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, getDay } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './Calendar.module.css';
import { Transaction } from '@/lib/types';
import { useRouter } from 'next/navigation';

interface CalendarProps {
    transactions: Transaction[];
    onDateSelect: (date: Date) => void;
    selectedDate: Date;
    currentMonth: Date;
    onMonthChange: (date: Date) => void;
    isLoading?: boolean;
}

export default function Calendar({ transactions, onDateSelect, selectedDate, currentMonth, onMonthChange, isLoading }: CalendarProps) {
    const router = useRouter();
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Calculate empty cells for start of month
    const startDay = getDay(monthStart); // 0 = Sunday
    const emptyDays = Array(startDay).fill(null);

    const getDayTransactions = (date: Date) => {
        return transactions.filter(t => isSameDay(new Date(t.date), date));
    };

    const getDailyTotal = (date: Date) => {
        const txs = getDayTransactions(date);
        const income = txs.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expense = txs.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        return { income, expense };
    };

    return (
        <div className={styles.calendarContainer}>
            <div className={styles.header}>
                <button onClick={() => {
                    const newDate = startOfMonth(subMonths(currentMonth, 1));
                    onMonthChange(newDate);
                    onDateSelect(newDate);
                }} className={styles.navBtn}>
                    <ChevronLeft size={20} />
                </button>
                <h2 className={styles.monthTitle}>{format(currentMonth, 'yyyy년 M월')}</h2>
                <button onClick={() => {
                    const newDate = startOfMonth(addMonths(currentMonth, 1));
                    onMonthChange(newDate);
                    onDateSelect(newDate);
                }} className={styles.navBtn}>
                    <ChevronRight size={20} />
                </button>
            </div>

            <div className={styles.grid}>
                {['일', '월', '화', '수', '목', '금', '토'].map(day => (
                    <div key={day} className={styles.dayHeader}>{day}</div>
                ))}

                {emptyDays.map((_, i) => (
                    <div key={`empty-${i}`} className={styles.emptyDay} />
                ))}

                {daysInMonth.map(date => {
                    const { income, expense } = getDailyTotal(date);
                    const isSelected = isSameDay(date, selectedDate);
                    const isToday = isSameDay(date, new Date());

                    return (
                        <button
                            key={date.toISOString()}
                            onClick={() => {
                                if (isSameDay(date, selectedDate)) {
                                    router.push(`/add?date=${format(date, 'yyyy-MM-dd')}`);
                                } else {
                                    onDateSelect(date);
                                }
                            }}
                            className={`${styles.dayCell} ${isSelected ? styles.selected : ''} ${isToday ? styles.today : ''}`}
                            disabled={isLoading}
                        >
                            <span className={styles.dayNumber}>{format(date, 'd')}</span>
                            {!isLoading && (
                                <>
                                    <div className={styles.dots}>
                                        {income > 0 && <div className={`${styles.dot} ${styles.incomeDot}`} />}
                                        {expense > 0 && <div className={`${styles.dot} ${styles.expenseDot}`} />}
                                    </div>
                                    {(income > 0 || expense > 0) && (
                                        <div className={styles.dayTotal}>
                                            {expense > 0 && <span className={styles.expenseText}>-{expense.toLocaleString()}</span>}
                                            {income > 0 && <span className={styles.incomeText}>+{income.toLocaleString()}</span>}
                                        </div>
                                    )}
                                </>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
